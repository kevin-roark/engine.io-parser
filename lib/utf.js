
/**
 * Encode a string into a utf-8 array buffer
 * original source: http://jsperf.com/uint8array-vs-array-encode-to-utf8/2
 * modified to send a smaller array
 *
 * @api public
 */
module.exports.encode = function strToArrayBuffer(str) {
  var n = str.length;
  var idx = 0;
  var bl = module.exports.byteLength(str);
  var utf8 = new Uint8Array(new ArrayBuffer(bl));
  var i, j, c;

  //http://user1.matsumoto.ne.jp/~goma/js/utf.js
  for(i = 0; i < n; ++i) {
    c = str.charCodeAt(i);
    if(c <= 0x7F){
      utf8[idx++] = c;
    } else if(c <= 0x7FF){
      utf8[idx++] = 0xC0 | (c >>> 6);
      utf8[idx++] = 0x80 | (c & 0x3F);
    } else if(c <= 0xFFFF){
      utf8[idx++] = 0xE0 | (c >>> 12);
      utf8[idx++] = 0x80 | ((c >>> 6) & 0x3F);
      utf8[idx++] = 0x80 | (c & 0x3F);
    } else {
      j = 4;
      while(c >> (6 * j)) j++;
      utf8[idx++] = ((0xFF00 >>> j) & 0xFF) | (c >>> (6 * --j));
      while(j--)
              utf8[idx++] = 0x80 | ((c >>> (6 * j)) & 0x3F);
    }
  }

  return utf8.buffer;
}


/**
 * Returns number of bytes required to turn a string to binary.
 *
 * @api public
 */
module.exports.byteLength = function utf8ByteLength(str) {
  var j, c;
  var len = 0;

  for(var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i);
    if(c <= 0x7F){
      len += 1;
    } else if(c <= 0x7FF){
      len += 2;
    } else if(c <= 0xFFFF){
      len += 3;
    } else {
      j = 4;
      while(c >> (6 * j)) j++;
      len += j;
    }
  }

  return len;
}

/**
 * Decode a utf-8 encoded array buffer into string.
 * original source: https://gist.github.com/boushley/5471599
 * modified to be smaller and not throw errors.
 *
 * @api public
 */
module.exports.decode = function decodeUtf8(arrayBuffer) {
  var result = "";
  var i = 0;
  var c, c2, c3;
  var data = new Uint8Array(arrayBuffer);

  // If we have a BOM skip it
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    i = 3;
  }

  while (i < data.length) {
    c = data[i];

    if (c < 128) {
      result += String.fromCharCode(c);
      i++;
    } else if (c > 191 && c < 224) {
      if (i+1 >= data.length) { // improper utf-8 encoding
        result += String.fromCharCode(c);
        return result;
      }
      c2 = data[i+1];
      result += String.fromCharCode( ((c&31)<<6) | (c2&63) );
      i += 2;
    } else {
      if (i+2 >= data.length) { // improper utf-8 encoding
        result += String.fromCharCode(c);
        return result;
      }
      c2 = data[i+1];
      c3 = data[i+2];
      result += String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
      i += 3;
    }
  }

  return result;
}
