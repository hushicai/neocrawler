var GBK = null;
var IP_RECORD_LENGTH = 7,
  REDIRECT_MODE_1 = 0x01,
  REDIRECT_MODE_2 = 0x02,
  IP_REGEXP = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
var dbug = false, log = console.log,
  pathDefined = __dirname + '/qqwry.dat', // IP库默认路径
  ipBegin, ipEnd, ipCount,
  ipFileBuffer = null, uninfo = true,
  unArea = '未知地区', unCountry = '未知国家';

exports.DBUG = function (a) { dbug = a != undefined ? a : true; return this; };
exports.info = function (dataPath) {
  var fs = require('fs'),
    Path = typeof (dataPath) == 'string' ? dataPath : pathDefined;
  var callback = typeof arguments[arguments.length - 1] == 'function' ? arguments[arguments.length - 1] : function () {};

  GBK = require('./gbk.js');
  ipFileBuffer = fs.readFileSync(Path); // 缓存IP库文件;
  ipBegin = ipFileBuffer.readUInt32LE(0, true); // 索引的开始位置;
  ipEnd = ipFileBuffer.readUInt32LE(4, true); // 索引的结束位置;
  ipCount = (ipEnd - ipBegin) / 7 + 1;
  dbug && log('==== Lib-qqwry Start! ==== [Begin:' + ipBegin + ' End:' + ipEnd + ' Count:' + ipCount + ']');
  uninfo = false;
  callback();
  return this;
};

// 查询IP的地址信息
exports.searchIP = function (IP) {
  uninfo && uninfo();
  var ip = this.ipToInt(IP),
    g = LocateIP(ip),
    loc = {};

  if (g == -1) { return {'ip': IP, 'Country': unArea, 'Area': unCountry}; }
  var add = setIPLocation(g);

  loc.ip = this.intToIP(ip);
  loc.Country = add.Country;
  loc.Area = add.Area;
  dbug && log(loc);
  return loc;
};

// 查询IP段的地址信息;scope
exports.searchIPScope = function (bginIP, endIP, callback) {
  uninfo && uninfo();
  var _ip1, _ip2, b_g, e_g, ips = [];

  try { _ip1 = this.ipToInt(bginIP); } catch (e) { throw ('The bginIP is not normal! >> ' + bginIP); }
  try { _ip2 = this.ipToInt(endIP); } catch (e) { throw ('The endIP is not normal! >> ' + endIP); }
  b_g = LocateIP(_ip1);
  e_g = LocateIP(_ip2);
  for (var i = b_g; i <= e_g; i += IP_RECORD_LENGTH) {
    var loc = {}, add = setIPLocation(i);

    loc.begIP = this.intToIP(ipFileBuffer.readUInt32LE(i, true));
    loc.endIP = this.intToIP(ipFileBuffer.readUInt32LE(setBuffer3(i + 4), true));
    loc.Country = add.Country;
    loc.Area = add.Area;
    ips.push(loc);
  }
  if (typeof callback === 'function') { callback(ips); }
  return ips;
};

// ip地址转int
exports.ipToInt = function (IP) {
  var result = IP_REGEXP.exec(IP), ip;

  if (result) {
    var ip_Arr = result.slice(1);

    ip = (parseInt(ip_Arr[0]) << 24
            | parseInt(ip_Arr[1]) << 16
            | parseInt(ip_Arr[2]) << 8
            | parseInt(ip_Arr[3])) >>> 0;
  } else if (/^\d+$/.test(IP) && (ip = parseInt(IP)) >= 0 && ip <= 0xFFFFFFFF) {

  } else {
    throw ('The IP address is not normal! >> ' + IP);
  }
  return ip;
};

// int转ip地址
exports.intToIP = function (INT) {
  if (INT < 0 || INT > 0xFFFFFFFF) {
    throw ('The number is not normal! >> ' + INT);
  };
  return (INT >>> 24) + '.' + (INT >>> 16 & 0xFF) + '.' + (INT >>> 8 & 0xFF) + '.' + (INT >>> 0 & 0xFF);
};

// IP数值高低字节位切换
exports.ipEndianChange = function (INT) {
  INT = INT & 0xFFFFFFFF;
  return (INT >>> 24 | (INT >> 8 & 0xFF00) | (INT << 8 & 0xFF0000) | (INT << 24)) >>> 0;
};

exports.infoAsync = function () {
  var o = this, args = arguments;

  setTimeout(function () { o.info.apply(o, args); });
  return this;
};

exports.searchIPScopeAsync = function (a, b, c) {
  var o = this;

  setTimeout(function () { o.searchIPScope(a, b, c); });
  return this;
};

// 查找地址信息
function setIPLocation (g) {
  var ipwz = setBuffer3(g + 4) + 4;
  var lx = ipFileBuffer.readUInt8(ipwz),
    loc = {};

  if (lx == REDIRECT_MODE_1) { // Country根据标识再判断
    ipwz = setBuffer3(ipwz + 1); // 读取国家偏移
    lx = ipFileBuffer.readUInt8(ipwz); // 再次获取标识字节
    var Gjbut;

    if (lx == REDIRECT_MODE_2) { // 再次检查标识字节
      Gjbut = setIpFileString(setBuffer3(ipwz + 1));
      loc.Country = GBK.dc_GBK(Gjbut);
      ipwz = ipwz + 4;
    } else {
      Gjbut = setIpFileString(ipwz);
      loc.Country = GBK.dc_GBK(Gjbut);
      ipwz += Gjbut.length + 1;
    }
    loc.Area = ReadArea(ipwz);
  } else if (lx == REDIRECT_MODE_2) { // Country直接读取偏移处字符串
    var Gjbut = setIpFileString(setBuffer3(ipwz + 1));

    loc.Country = GBK.dc_GBK(Gjbut);
    loc.Area = ReadArea(ipwz + 4);
  } else { // Country直接读取 Area根据标志再判断
    var Gjbut = setIpFileString(ipwz);

    ipwz += Gjbut.length + 1;
    loc.Country = GBK.dc_GBK(Gjbut);
    loc.Area = ReadArea(ipwz);
  }
  return loc;
}

// 读取Area
function ReadArea (offset) {
  var one = ipFileBuffer.readUInt8(offset);

  if (one == REDIRECT_MODE_1 || one == REDIRECT_MODE_2) {
    var areaOffset = setBuffer3(offset + 1);

    if (areaOffset == 0) {
      return unArea;
    } else {
      return GBK.dc_GBK(setIpFileString(areaOffset));
    }
  } else {
    return GBK.dc_GBK(setIpFileString(offset));
  }
}

// 获取3字节的索引地址;
function setBuffer3 (n) {
  return ipFileBuffer.readUInt32LE(n, true) & 0xFFFFFF;
}

// (拼接的Buffer中)读取字节,直到为0x00结束,返回数组
function setIpFileString (Begin) {
  var B = Begin || 0, toarr = [], M = ipFileBuffer.length;

  B = B < 0 ? 0 : B;
  for (var i = B; i < M; i++) {
    if (ipFileBuffer[i] == 0) {
      return toarr;
    }
    toarr.push(ipFileBuffer[i]);
  }
  return toarr;
}

// 取得begin和end中间的偏移(用于2分法查询);
function GetMiddleOffset (begin, end, recordLength) {
  var records = ((end - begin) / recordLength >> 1) * recordLength + begin;

  return records ^ begin ? records : records + recordLength;
}

// 2分法查找指定的IP偏移
function LocateIP (ip) {
  var g, temp;

  for (var b = ipBegin, e = ipEnd; b < e;) {
    g = GetMiddleOffset(b, e, IP_RECORD_LENGTH);// 获取中间位置
    temp = ipFileBuffer.readUInt32LE(g, true);
    if (ip > temp) {
      b = g;
    } else if (ip < temp) {
      if (g == e) {
        g -= IP_RECORD_LENGTH;
        break;
      }
      e = g;
    } else {
      break;
    }
  }
  if (dbug) {
    var begip = ipFileBuffer.readUInt32LE(g, true);

    endip = ipFileBuffer.readUInt32LE(setBuffer3(g + 4), true); // 获取结束IP的值
    log(exports.intToIP(ip) + ' >> ' + ip);
    log('>> Indexes as "' + g + '" ( ' + begip + ' --> ' + endip + ' )');
    if (ip > endip) { // 与结束IP比较；正常情况不会出现这种情况,除非IP库漏掉了一些IP;
      return -1;
    }
  }
  return g;
}

// 未初始化
function uninfo () {
  throw ('The lib-qqwry is Uninitialized!');
}
