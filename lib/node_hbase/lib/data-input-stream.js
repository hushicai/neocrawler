// Generated by CoffeeScript 1.8.0
(function() {
  var ByteBuffer, DataInputStream, EventEmitter, Readable, debug,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  debug = require('debug')('hbase:data_input_stream');

  Readable = require('readable-stream').Readable;

  ByteBuffer = require('protobufjs/node_modules/bytebuffer');

  EventEmitter = require('events').EventEmitter;

  module.exports = DataInputStream = (function(_super) {
    __extends(DataInputStream, _super);

    function DataInputStream(io) {
      this.processMessage = __bind(this.processMessage, this);
      this.processData = __bind(this.processData, this);
      this["in"] = io;
      if (typeof io.read !== 'function') {
        this["in"] = new Readable();
        this["in"].wrap(io);
      }
      this.bytearr = new Buffer(80);
      this.buffer = new Buffer(0);
      this.awaitBytes = 0;
      this["in"].on('data', this.processData);
    }

    DataInputStream.prototype.processData = function(data) {
      if (!data) {
        data = new Buffer(0);
      }
      this.buffer = Buffer.concat([this.buffer, data]);
      if (this.awaitBytes === 0 && this.buffer.length < 4) {
        return;
      }
      if (!this.awaitBytes) {
        this.awaitBytes = this.buffer.readUInt32BE(0);
        this.buffer = this.buffer.slice(4);
      }
      if (this.awaitBytes && this.awaitBytes > this.buffer.length) {
        return;
      }
      this.processMessage(this.buffer.slice(0, this.awaitBytes));
      this.buffer = this.buffer.slice(this.awaitBytes);
      this.awaitBytes = 0;
      if (this.buffer.length > 0) {
        return this.processData();
      }
    };

    DataInputStream.prototype.processMessage = function(message) {
      var messages, payload, readDelimited;
      payload = ByteBuffer.wrap(message);
      readDelimited = function() {
        var header, headerLen;
        headerLen = payload.readVarint32();
        header = payload.slice(payload.offset, payload.offset + headerLen);
        payload.offset += headerLen;
        return header.toBuffer();
      };
      messages = [];
      while (payload.remaining()) {
        messages.push(readDelimited());
      }
      return this.emit('messages', messages);
    };

    return DataInputStream;

  })(EventEmitter);

}).call(this);