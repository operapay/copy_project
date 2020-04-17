set PUBLIC_URL=https://operapay.github.io/project/
call npm run build
cd build
git init
git remote add origin https://github.com/operapay/project
git checkout --orphan gh-pages
git add .
git commit -am "update page"
git push -f -u origin gh-pages
cd ..