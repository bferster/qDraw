echo "Publishing qDraw"
cat pie.js \
qdraw.js \
qdraw2.js \
> qdraw-all.js
jsmin.exe <qdraw-all.js >qdraw-all-min.js
