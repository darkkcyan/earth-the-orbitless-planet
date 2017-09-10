sed -i 's/\.prototype/[$]/g' main.min.js
printf '$="prototype";' | cat - main.min.js > temp.js
rm main.min.js
mv temp.js main.min.js