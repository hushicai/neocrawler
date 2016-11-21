define('ace/mode/json', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text', 'ace/tokenizer', 'ace/mode/json_highlight_rules', 'ace/mode/matching_brace_outdent', 'ace/mode/behaviour/cstyle', 'ace/mode/folding/cstyle', 'ace/worker/worker_client'], function (e, t, n) {
  var r = e('../lib/oop'), i = e('./text').Mode, s = e('../tokenizer').Tokenizer, o = e('./json_highlight_rules').JsonHighlightRules, u = e('./matching_brace_outdent').MatchingBraceOutdent, a = e('./behaviour/cstyle').CstyleBehaviour, f = e('./folding/cstyle').FoldMode, l = e('../worker/worker_client').WorkerClient, c = function () { this.$tokenizer = new s((new o()).getRules()), this.$outdent = new u(), this.$behaviour = new a(), this.foldingRules = new f(); };

  r.inherits(c, i), (function () {
    this.getNextLineIndent = function (e, t, n) {
      var r = this.$getIndent(t);

      if (e == 'start') {
        var i = t.match(/^.*[\{\(\[]\s*$/);

        i && (r += n);
      } return r;
    }, this.checkOutdent = function (e, t, n) { return this.$outdent.checkOutdent(t, n); }, this.autoOutdent = function (e, t, n) { this.$outdent.autoOutdent(t, n); }, this.createWorker = function (e) {
      var t = new l(['ace'], 'ace/mode/json_worker', 'JsonWorker');

      return t.attachToDocument(e.getDocument()), t.on('error', function (t) { e.setAnnotations([t.data]); }), t.on('ok', function () { e.clearAnnotations(); }), t;
    };
  }.call(c.prototype)), t.Mode = c;
}), define('ace/mode/json_highlight_rules', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function (e, t, n) {
  var r = e('../lib/oop'), i = e('./text_highlight_rules').TextHighlightRules, s = function () { this.$rules = {start: [{token: 'variable', regex: '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:)'}, {token: 'string', regex: '"', next: 'string'}, {token: 'constant.numeric', regex: '0[xX][0-9a-fA-F]+\\b'}, {token: 'constant.numeric', regex: '[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b'}, {token: 'constant.language.boolean', regex: '(?:true|false)\\b'}, {token: 'invalid.illegal', regex: "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"}, {token: 'invalid.illegal', regex: '\\/\\/.*$'}, {token: 'paren.lparen', regex: '[[({]'}, {token: 'paren.rparen', regex: '[\\])}]'}, {token: 'text', regex: '\\s+'}], string: [{token: 'constant.language.escape', regex: /\\(?:x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|["\\\/bfnrt])/}, {token: 'string', regex: '[^"\\\\]+'}, {token: 'string', regex: '"', next: 'start'}, {token: 'string', regex: '', next: 'start'}]}; };

  r.inherits(s, i), t.JsonHighlightRules = s;
}), define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module', 'ace/range'], function (e, t, n) {
  var r = e('../range').Range, i = function () {};

  (function () {
    this.checkOutdent = function (e, t) { return /^\s+$/.test(e) ? /^\s*\}/.test(t) : !1; }, this.autoOutdent = function (e, t) {
      var n = e.getLine(t), i = n.match(/^(\s*\})/);

      if (!i) return 0; var s = i[1].length, o = e.findMatchingBracket({row: t, column: s});

      if (!o || o.row == t) return 0; var u = this.$getIndent(e.getLine(o.row));

      e.replace(new r(t, 0, t, s - 1), u);
    }, this.$getIndent = function (e) {
      var t = e.match(/^(\s+)/);

      return t ? t[1] : '';
    };
  }).call(i.prototype), t.MatchingBraceOutdent = i;
}), define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function (e, t, n) {
  var r = e('../../lib/oop'), i = e('../behaviour').Behaviour, s = e('../../token_iterator').TokenIterator, o = e('../../lib/lang'), u = ['text', 'paren.rparen', 'punctuation.operator'], a = ['text', 'paren.rparen', 'punctuation.operator', 'comment'], f = 0, l = -1, c = '', h = 0, p = -1, d = '', v = '', m = function () {
      m.isSaneInsertion = function (e, t) {
        var n = e.getCursorPosition(), r = new s(t, n.row, n.column);

        if (!this.$matchTokenType(r.getCurrentToken() || 'text', u)) {
          var i = new s(t, n.row, n.column + 1);

          if (!this.$matchTokenType(i.getCurrentToken() || 'text', u)) return !1;
        } return r.stepForward(), r.getCurrentTokenRow() !== n.row || this.$matchTokenType(r.getCurrentToken() || 'text', a);
      }, m.$matchTokenType = function (e, t) { return t.indexOf(e.type || e) > -1; }, m.recordAutoInsert = function (e, t, n) {
        var r = e.getCursorPosition(), i = t.doc.getLine(r.row);

        this.isAutoInsertedClosing(r, i, c[0]) || (f = 0), l = r.row, c = n + i.substr(r.column), f++;
      }, m.recordMaybeInsert = function (e, t, n) {
        var r = e.getCursorPosition(), i = t.doc.getLine(r.row);

        this.isMaybeInsertedClosing(r, i) || (h = 0), p = r.row, d = i.substr(0, r.column) + n, v = i.substr(r.column), h++;
      }, m.isAutoInsertedClosing = function (e, t, n) { return f > 0 && e.row === l && n === c[0] && t.substr(e.column) === c; }, m.isMaybeInsertedClosing = function (e, t) { return h > 0 && e.row === p && t.substr(e.column) === v && t.substr(0, e.column) == d; }, m.popAutoInsertedClosing = function () { c = c.substr(1), f--; }, m.clearMaybeInsertedClosing = function () { h = 0, p = -1; }, this.add('braces', 'insertion', function (e, t, n, r, i) {
        var s = n.getCursorPosition(), u = r.doc.getLine(s.row);

        if (i == '{') {
          var a = n.getSelectionRange(), f = r.doc.getTextRange(a);

          if (f !== '' && f !== '{' && n.getWrapBehavioursEnabled()) return {text: '{' + f + '}', selection: !1}; if (m.isSaneInsertion(n, r)) return /[\]\}\)]/.test(u[s.column]) ? (m.recordAutoInsert(n, r, '}'), {text: '{}', selection: [1, 1]}) : (m.recordMaybeInsert(n, r, '{'), {text: '{', selection: [1, 1]});
        } else if (i == '}') {
          var l = u.substring(s.column, s.column + 1);

          if (l == '}') {
            var c = r.$findOpeningBracket('}', {column: s.column + 1, row: s.row});

            if (c !== null && m.isAutoInsertedClosing(s, u, i)) return m.popAutoInsertedClosing(), {text: '', selection: [1, 1]};
          }
        } else if (i == '\n' || i == '\r\n') {
          var p = '';

          m.isMaybeInsertedClosing(s, u) && (p = o.stringRepeat('}', h), m.clearMaybeInsertedClosing()); var l = u.substring(s.column, s.column + 1);

          if (l == '}' || p !== '') {
            var d = r.findMatchingBracket({row: s.row, column: s.column}, '}');

            if (!d) return null; var v = this.getNextLineIndent(e, u.substring(0, s.column), r.getTabString()), g = this.$getIndent(u);

            return {text: '\n' + v + '\n' + g + p, selection: [1, v.length, 1, v.length]};
          }
        }
      }), this.add('braces', 'deletion', function (e, t, n, r, i) {
        var s = r.doc.getTextRange(i);

        if (!i.isMultiLine() && s == '{') {
          var o = r.doc.getLine(i.start.row), u = o.substring(i.end.column, i.end.column + 1);

          if (u == '}') return i.end.column++, i; h--;
        }
      }), this.add('parens', 'insertion', function (e, t, n, r, i) {
        if (i == '(') {
          var s = n.getSelectionRange(), o = r.doc.getTextRange(s);

          if (o !== '' && n.getWrapBehavioursEnabled()) return {text: '(' + o + ')', selection: !1}; if (m.isSaneInsertion(n, r)) return m.recordAutoInsert(n, r, ')'), {text: '()', selection: [1, 1]};
        } else if (i == ')') {
          var u = n.getCursorPosition(), a = r.doc.getLine(u.row), f = a.substring(u.column, u.column + 1);

          if (f == ')') {
            var l = r.$findOpeningBracket(')', {column: u.column + 1, row: u.row});

            if (l !== null && m.isAutoInsertedClosing(u, a, i)) return m.popAutoInsertedClosing(), {text: '', selection: [1, 1]};
          }
        }
      }), this.add('parens', 'deletion', function (e, t, n, r, i) {
        var s = r.doc.getTextRange(i);

        if (!i.isMultiLine() && s == '(') {
          var o = r.doc.getLine(i.start.row), u = o.substring(i.start.column + 1, i.start.column + 2);

          if (u == ')') return i.end.column++, i;
        }
      }), this.add('brackets', 'insertion', function (e, t, n, r, i) {
        if (i == '[') {
          var s = n.getSelectionRange(), o = r.doc.getTextRange(s);

          if (o !== '' && n.getWrapBehavioursEnabled()) return {text: '[' + o + ']', selection: !1}; if (m.isSaneInsertion(n, r)) return m.recordAutoInsert(n, r, ']'), {text: '[]', selection: [1, 1]};
        } else if (i == ']') {
          var u = n.getCursorPosition(), a = r.doc.getLine(u.row), f = a.substring(u.column, u.column + 1);

          if (f == ']') {
            var l = r.$findOpeningBracket(']', {column: u.column + 1, row: u.row});

            if (l !== null && m.isAutoInsertedClosing(u, a, i)) return m.popAutoInsertedClosing(), {text: '', selection: [1, 1]};
          }
        }
      }), this.add('brackets', 'deletion', function (e, t, n, r, i) {
        var s = r.doc.getTextRange(i);

        if (!i.isMultiLine() && s == '[') {
          var o = r.doc.getLine(i.start.row), u = o.substring(i.start.column + 1, i.start.column + 2);

          if (u == ']') return i.end.column++, i;
        }
      }), this.add('string_dquotes', 'insertion', function (e, t, n, r, i) {
        if (i == '"' || i == "'") {
          var s = i, o = n.getSelectionRange(), u = r.doc.getTextRange(o);

          if (u !== '' && u !== "'" && u != '"' && n.getWrapBehavioursEnabled()) return {text: s + u + s, selection: !1}; var a = n.getCursorPosition(), f = r.doc.getLine(a.row), l = f.substring(a.column - 1, a.column);

          if (l == '\\') return null; var c = r.getTokens(o.start.row), h = 0, p, d = -1;

          for (var v = 0; v < c.length; v++) { p = c[v], p.type == 'string' ? d = -1 : d < 0 && (d = p.value.indexOf(s)); if (p.value.length + h > o.start.column) break; h += c[v].value.length; } if (!p || d < 0 && p.type !== 'comment' && (p.type !== 'string' || o.start.column !== p.value.length + h - 1 && p.value.lastIndexOf(s) === p.value.length - 1)) { if (!m.isSaneInsertion(n, r)) return; return {text: s + s, selection: [1, 1]}; } if (p && p.type === 'string') {
            var g = f.substring(a.column, a.column + 1);

            if (g == s) return {text: '', selection: [1, 1]};
          }
        }
      }), this.add('string_dquotes', 'deletion', function (e, t, n, r, i) {
        var s = r.doc.getTextRange(i);

        if (!i.isMultiLine() && (s == '"' || s == "'")) {
          var o = r.doc.getLine(i.start.row), u = o.substring(i.start.column + 1, i.start.column + 2);

          if (u == s) return i.end.column++, i;
        }
      });
    };

  r.inherits(m, i), t.CstyleBehaviour = m;
}), define('ace/mode/folding/cstyle', ['require', 'exports', 'module', 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function (e, t, n) {
  var r = e('../../lib/oop'), i = e('../../range').Range, s = e('./fold_mode').FoldMode, o = t.FoldMode = function () {};

  r.inherits(o, s), (function () {
    this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/, this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/, this.getFoldWidgetRange = function (e, t, n) {
      var r = e.getLine(n), i = r.match(this.foldingStartMarker);

      if (i) {
        var s = i.index;

        return i[1] ? this.openingBracketBlock(e, i[1], n, s) : e.getCommentFoldRange(n, s + i[0].length, 1);
      } if (t !== 'markbeginend') return; var i = r.match(this.foldingStopMarker);

      if (i) {
        var s = i.index + i[0].length;

        return i[1] ? this.closingBracketBlock(e, i[1], n, s) : e.getCommentFoldRange(n, s, -1);
      }
    };
  }.call(o.prototype));
});
