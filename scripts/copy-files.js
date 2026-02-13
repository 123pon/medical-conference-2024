// scripts/copy-files.js
const fs = require('fs-extra');
const path = require('path');

// 源目录（项目根目录）
const sourceDir = path.join(__dirname, '..');
// 目标目录（输出目录）
const targetDir = path.join(sourceDir, 'dist');

// 需要复制到dist目录的文件和文件夹列表
const itemsToCopy = [
    'index.html',
    'check-data-source.html',
    'css/',
    'js/',
    'images/',
    'assets/'
];

// 需要排除的文件/文件夹（使用 glob 模式或正则表达式）
const excludePatterns = [
    '.git',
    '.gitignore',
    'node_modules',
    'dist',
    'scripts',
    /\.md$/,                    // 排除所有 .md 文件
    /debug[\w-]*\.(js|sh)$/,   // 排除 debug.* 文件
    /package-lock\.json/        // 排除 package-lock.json
];

// 检查是否应该排除该项
function shouldExclude(filePath) {
    const baseName = path.basename(filePath);
    
    for (const pattern of excludePatterns) {
        if (typeof pattern === 'string') {
            if (baseName === pattern || filePath.includes(pattern)) {
                return true;
            }
        } else if (pattern instanceof RegExp) {
            if (pattern.test(baseName)) {
                return true;
            }
        }
    }
    return false;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// 递归计算文件夹大小
async function getDirectorySize(dirPath) {
    let size = 0;
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (shouldExclude(fullPath)) {
            continue;
        }
        
        if (entry.isDirectory()) {
            size += await getDirectorySize(fullPath);
        } else {
            const stats = await fs.stat(fullPath);
            size += stats.size;
        }
    }
    
    return size;
}

// 统计构建结果
async function getDeploymentStats(targetPath) {
    let totalSize = 0;
    let fileCount = 0;
    
    const walkDir = async (dir) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                await walkDir(fullPath);
            } else {
                const stats = await fs.stat(fullPath);
                totalSize += stats.size;
                fileCount++;
            }
        }
    };
    
    await walkDir(targetPath);
    
    return { totalSize, fileCount };
}

async function copyFiles() {
    console.log('🚀 开始构建部署文件...\n');
    
    try {
        // 确保目标目录存在且为空
        await fs.emptyDir(targetDir);
        console.log(`📁 清空目标目录: ${targetDir}\n`);

        let copiedCount = 0;
        let skippedCount = 0;

        // 逐一复制列表中的项目
        for (const item of itemsToCopy) {
            const srcPath = path.join(sourceDir, item);
            const destPath = path.join(targetDir, item);

            // 检查源路径是否存在
            if (!(await fs.pathExists(srcPath))) {
                console.warn(`⚠️  源文件不存在，跳过: ${item}`);
                skippedCount++;
                continue;
            }

            // 检查是否应该排除
            if (shouldExclude(srcPath)) {
                console.warn(`⊘  已排除: ${item}`);
                skippedCount++;
                continue;
            }

            // 复制文件
            await fs.copy(srcPath, destPath, {
                filter: (srcFile) => {
                    return !shouldExclude(srcFile);
                }
            });

            // 获取复制的文件大小
            const size = await fs.stat(srcPath);
            const isDir = size.isDirectory ? (await fs.stat(srcPath)).isDirectory() : false;
            
            if (isDir) {
                const dirSize = await getDirectorySize(destPath);
                console.log(`✅ 已复制: ${item.padEnd(20)} (${formatFileSize(dirSize)})`);
            } else {
                console.log(`✅ 已复制: ${item.padEnd(20)} (${formatFileSize(size.size)})`);
            }

            copiedCount++;
        }

        // 统计部署信息
        const stats = await getDeploymentStats(targetDir);
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 部署统计`);
        console.log(`${'='.repeat(60)}`);
        console.log(`📁 目标目录: ${targetDir}`);
        console.log(`✅ 已复制项: ${copiedCount} 个`);
        console.log(`⊘  已排除项: ${skippedCount} 个`);
        console.log(`📄 文件总数: ${stats.fileCount} 个`);
        console.log(`📦 总大小: ${formatFileSize(stats.totalSize)}`);
        console.log(`${'='.repeat(60)}\n`);

        console.log(`🎉 构建完成！所有文件已复制到 dist 目录`);
        console.log(`📤 现在可以将 dist/ 目录部署到云服务器\n`);
    } catch (err) {
        console.error('❌ 构建过程中发生错误:', err);
        process.exit(1);
    }
}

copyFiles();