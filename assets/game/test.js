var buffer = null, bufferCtx = null;

function getSpriteData(_sprite)
{
    if (!buffer) { //shared buffer...
        buffer = document.createElement("canvas");
        bufferCtx = buffer.getContext("2d");
    }
    buffer.width = _sprite.size.x;
    buffer.height = _sprite.size.y;
    bufferCtx.drawImage(_sprite.source.Image,
            _sprite.source.position.x,
            _sprite.source.position.y,
            _sprite.source.size.x,
            _sprite.source.size.y,
            0,
            0,
            _sprite.source.size.x,
            _sprite.source.size.y);
    return bufferCtx.getImageData(0, 0, buffer.width, buffer.height);       
}

function tint(_sprite, _tint)
{
    let pixels = getSpriteData(_sprite);
    let d = pixels.data;
    let color, iEdit, iMin, iMax;
    for (let i = 0; i < d.length; i += 4)
    {
        let color = [d[i], d[i + 1], d[i + 2]];

        let minMax = function (_value1, _value2)
        {
            if (color[_value1] > color[_value2])
            {
                iMax = _value1;
                iMin = _value2;
            } else
            {
                iMax = _value2;
                iMin = _value1;
            }
        };

        if (color[0] === color[1]) // pair
        {
            if (color[0] === color[2]) // all three channels are the same, continue
                continue;
            iEdit = 0;
            minMax(2, 0);
        } else if (color[1] === color[2]) // pair
        {
            iEdit = 1;
            minMax(0, 1);
        } else if (color[2] === color[0]) // pair
        {
            iEdit = 2;
            minMax(1, 2);
        } else // no pair
        {
            let sColor = Object.keys(color).sort(function (a, b) {
                return -(color[b] - color[a]);
            });
            iMin = sColor[0];
            iEdit = sColor[1];
            iMax = sColor[2];
        }
        
        let iTarget = function()
        {
            if (iEdit !== 0)
                return iEdit--;
            else
                return 1;
        };
        
        let step = ((color[sColor[2]] - color[sColor[0]])/60);
        let turns = ((_tint / 60) | 0)%6;
        let plus = (_tint%60 - (color[iMax] - color[iEdit])/step)|0;
        
        for (let i = 0, target; i < turns; i++) 
        {
            target = iTarget();
            color[iEdit] = color[target];
            iEdit = target;
        }
        let target = iTarget();
        if (color[iEdit] < color[target])
        {
            color[iEdit] += plus;
        } else
        {
            color[iEdit] -= plus;
        }
        
        
    }
    bufferCtx.putImageData(pixels, 0, 0);
}

////R, G and B input range = 0 ÷ 255
////H, S and V output range = 0 ÷ 1.0
//
//var_R = ( R / 255 )
//var_G = ( G / 255 )
//var_B = ( B / 255 )
//
//var_Min = min( var_R, var_G, var_B )    //Min. value of RGB
//var_Max = max( var_R, var_G, var_B )    //Max. value of RGB
//del_Max = var_Max - var_Min             //Delta RGB value
//
//V = var_Max
//
//if ( del_Max == 0 )                     //This is a gray, no chroma...
//{
//    H = 0
//    S = 0
//}
//else                                    //Chromatic data...
//{
//   S = del_Max / var_Max
//
//   del_R = ( ( ( var_Max - var_R ) / 6 ) + ( del_Max / 2 ) ) / del_Max
//   del_G = ( ( ( var_Max - var_G ) / 6 ) + ( del_Max / 2 ) ) / del_Max
//   del_B = ( ( ( var_Max - var_B ) / 6 ) + ( del_Max / 2 ) ) / del_Max
//
//   if      ( var_R == var_Max ) H = del_B - del_G
//   else if ( var_G == var_Max ) H = ( 1 / 3 ) + del_R - del_B
//   else if ( var_B == var_Max ) H = ( 2 / 3 ) + del_G - del_R
//
//    if ( H < 0 ) H += 1
//    if ( H > 1 ) H -= 1
//}


////H, S and V input range = 0 ÷ 1.0
////R, G and B output range = 0 ÷ 255
//
//if ( S == 0 )
//{
//   R = V * 255
//   G = V * 255
//   B = V * 255
//}
//else
//{
//   var_h = H * 6
//   if ( var_h == 6 ) var_h = 0      //H must be < 1
//   var_i = int( var_h )             //Or ... var_i = floor( var_h )
//   var_1 = V * ( 1 - S )
//   var_2 = V * ( 1 - S * ( var_h - var_i ) )
//   var_3 = V * ( 1 - S * ( 1 - ( var_h - var_i ) ) )
//
//   if      ( var_i == 0 ) { var_r = V     ; var_g = var_3 ; var_b = var_1 }
//   else if ( var_i == 1 ) { var_r = var_2 ; var_g = V     ; var_b = var_1 }
//   else if ( var_i == 2 ) { var_r = var_1 ; var_g = V     ; var_b = var_3 }
//   else if ( var_i == 3 ) { var_r = var_1 ; var_g = var_2 ; var_b = V     }
//   else if ( var_i == 4 ) { var_r = var_3 ; var_g = var_1 ; var_b = V     }
//   else                   { var_r = V     ; var_g = var_1 ; var_b = var_2 }
//
//   R = var_r * 255
//   G = var_g * 255
//   B = var_b * 255
//}

// Changes the RGB/HEX temporarily to a HSL-Value, modifies that value 
// and changes it back to RGB/HEX.




//Examples

function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(rgb.length == 3){
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return rgbToHex(r,g,b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}