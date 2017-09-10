sed -i 's/\.prototype/[$]/g' main.min.js
sed -i 's/Math\.random/$r/g' main.min.js
sed -i 's/\.lineTo/[$l]/g' main.min.js
sed -i 's/\.currentTime/\.c/g' main.min.js
printf '$="prototype";$r=Math.random;$l="lineTo";' | cat - main.min.js > temp.js
rm main.min.js
mv temp.js main.min.js