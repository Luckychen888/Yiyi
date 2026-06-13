const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const sourceDir = 'D:\\微信开发者\\小怿专属';
const targetDir = 'D:\\YIYi';

console.log('=== 恋人空间项目迁移脚本 ===\n');
console.log('源目录:', sourceDir);
console.log('目标目录:', targetDir, '\n');

// 1. 检查源目录是否存在
console.log('1. 检查源目录...');
if (!fs.existsSync(sourceDir)) {
  console.error('错误: 源目录不存在:', sourceDir);
  process.exit(1);
}
console.log('✓ 源目录存在\n');

// 2. 准备目标目录
console.log('2. 准备目标目录...');
try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  } else {
    // 如果存在，先清空
    const files = fs.readdirSync(targetDir);
    for (const file of files) {
      const filePath = path.join(targetDir, file);
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  }
  console.log('✓ 目标目录已准备\n');
} catch (err) {
  console.error('准备目标目录失败:', err.message);
  process.exit(1);
}

// 3. 复制文件到目标目录
console.log('3. 复制项目文件...');
let fileCount = 0;
let errorCount = 0;

function copyDir(src, dest) {
  try {
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      // 跳过 node_modules
      if (entry.name === 'node_modules') continue;
      
      try {
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
          fileCount++;
        }
      } catch (fileErr) {
        errorCount++;
        // 忽略某些文件复制错误，继续复制其他文件
      }
    }
  } catch (dirErr) {
    errorCount++;
  }
}

try {
  copyDir(sourceDir, targetDir);
  console.log('✓ 文件复制完成');
  console.log(`  - 成功复制 ${fileCount} 个文件`);
  if (errorCount > 0) {
    console.log(`  - 跳过 ${errorCount} 个无法复制的文件\n`);
  } else {
    console.log('');
  }
} catch (err) {
  console.error('复制失败:', err.message);
  process.exit(1);
}

// 4. 更新 project.config.json
console.log('4. 更新项目配置...');
const projectConfigPath = path.join(targetDir, 'project.config.json');
if (fs.existsSync(projectConfigPath)) {
  let config = fs.readFileSync(projectConfigPath, 'utf-8');
  config = config.replace(/恋人空间/g, '恋人空间');
  fs.writeFileSync(projectConfigPath, config);
  console.log('✓ project.config.json 已更新\n');
}

// 5. 删除 package-lock.json（强制重新安装）
console.log('5. 清理锁文件...');
const lockPath = path.join(targetDir, 'package-lock.json');
if (fs.existsSync(lockPath)) {
  fs.unlinkSync(lockPath);
  console.log('✓ package-lock.json 已删除\n');
}

// 6. 安装依赖
console.log('6. 安装项目依赖...');
console.log('注意: 这可能需要几分钟时间，请耐心等待...\n');

const npmProcess = spawn('npm.cmd', ['install', '--legacy-peer-deps'], {
  cwd: targetDir,
  stdio: 'inherit',
  shell: true,
  env: process.env
});

npmProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✓ 依赖安装成功！\n');
    
    // 7. 构建项目
    console.log('7. 构建微信小程序...\n');
    const buildProcess = spawn('npm.cmd', ['run', 'build:weapp'], {
      cwd: targetDir,
      stdio: 'inherit',
      shell: true,
      env: process.env
    });
    
    buildProcess.on('close', (buildCode) => {
      if (buildCode === 0) {
        console.log('\n========================================');
        console.log('  ✓ 构建成功！');
        console.log('========================================\n');
        console.log('项目位置:', targetDir);
        console.log('\n请在微信开发者工具中导入项目目录:');
        console.log('  ' + targetDir);
        console.log('\n========================================\n');
        process.exit(0);
      } else {
        console.error('\n✗ 构建失败，错误码:', buildCode);
        console.log('请手动执行: cd ' + targetDir + ' && npm run build:weapp');
        process.exit(1);
      }
    });
    
    buildProcess.on('error', (err) => {
      console.error('构建进程启动失败:', err.message);
      process.exit(1);
    });
    
  } else {
    console.error('\n✗ 依赖安装失败，错误码:', code);
    console.log('请手动执行: cd ' + targetDir + ' && npm install --legacy-peer-deps');
    process.exit(1);
  }
});

npmProcess.on('error', (err) => {
  console.error('npm 进程启动失败:', err.message);
  process.exit(1);
});