@echo off
set /p commit-msg="commit message: "
git add .
git commit -am "%commit-msg%"
git push heroku master