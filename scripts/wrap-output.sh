sed -i 's/\.prototype/[$]/g' main.min.js
sed -i 's/Math\.random/$r/g' main.min.js
printf '$="prototype";$r=Math.random;' | cat - main.min.js > temp.js
rm main.min.js
mv temp.js main.min.js
(
  cat ./src/pre.html
  cat ./main.min.js
  cat ./src/post.html
) > ./index.html