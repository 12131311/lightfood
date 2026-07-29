@echo off
echo ===== 减肥小程序 - 一键部署到 Vercel =====
echo.
echo 第1步: 安装 Vercel CLI（如果还没装的话）
call npm install -g vercel
if %ERRORLEVEL% NEQ 0 (
  echo 安装失败，请确保已安装 Node.js
  pause
  exit /b 1
)
echo.
echo 第2步: 登录 Vercel（会打开浏览器）
call vercel login
echo.
echo 第3步: 部署到线上
cd /d "%~dp0"
call vercel --prod
echo.
echo 部署完成！复制上面的 URL 到微信里就能打开。
pause
