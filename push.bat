@echo off
echo [1/3] Building the project...
call npm run build

echo [2/3] Pushing source code to main...
git init
git add .
git commit -m "Remove project numbers and fix paths"
git remote add origin https://github.com/moutiebenamor/my_portfolio 2>nul
git remote set-url origin https://github.com/moutiebenamor/my_portfolio
git push -u origin main

echo [3/3] Deploying build to GitHub Pages...
npx -y gh-pages -d dist

echo.
echo Done! Your site is deploying. Give it a minute or two to update on GitHub.
pause
