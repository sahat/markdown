/*! html-md v3.0.2 | (c) 2013 Alasdair Mercer | MIT License
 Make.text v1.5 | (c) 2007 Trevor Jim
 */
(function() {
  var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o = {}.hasOwnProperty, p = this;
  a = {absolute: !1, base: "undefined" != typeof window && null !== window ? window.document.baseURI : "file://" + process.cwd(), debug: !1, inline: !1}, c = this.md, e = {"\\\\": "\\\\", "\\[": "\\[", "\\]": "\\]", ">": "\\>", _: "\\_", "\\*": "\\*", "`": "\\`", "#": "\\#", "([0-9])\\.(\\s|$)": "$1\\.$2", "©": "(c)", "®": "(r)", "™": "(tm)", " ": " ", "·": "\\*", " ": " ", " ": " ", " ": " ", "‘": "'", "’": "'", "“": '"', "”": '"', "…": "...", "–": "--", "—": "---"}, f = /(display|visibility)\s*:\s*[a-z]+/gi, g = /(none|hidden)\s*$/i, h = /^(APPLET|AREA|AUDIO|BUTTON|CANVAS|DATALIST|EMBED|HEAD|INPUT|MAP|MENU|METER|NOFRAMES|NOSCRIPT|OBJECT|OPTGROUP|OPTION|PARAM|PROGRESS|RP|RT|RUBY|SCRIPT|SELECT|STYLE|TEXTAREA|TITLE|VIDEO)$/, i = /^(ADDRESS|ARTICLE|ASIDE|DIV|FIELDSET|FOOTER|HEADER|NAV|P|SECTION)$/, d = function() {
    m = {};
    for (j in e)o.call(e, j) && (m[j] = new RegExp(j, "g"));
    return m
  }(), l = function(a, b, c) {
    var d, e;
    if (null == a && (a = ""), null == b && (b = 0), null == c && (c = " "), !c)return a;
    for (d = e = 0; b >= 0 ? b > e : e > b; d = b >= 0 ? ++e : --e)a = c + a;
    return a
  }, n = function(a) {
    return null == a && (a = ""), a.trim ? a.trim() : a.replace(/^\s+|\s+$/g, "")
  }, b = function() {
    function b(b, c) {
      var d, e;
      this.html = null != b ? b : "", this.options = null != c ? c : {}, this.atLeft = this.atNoWS = this.atP = !0, this.buffer = "", this.exceptions = [], this.order = 1, this.listDepth = 0, this.inCode = this.inPre = this.inOrderedList = !1, this.last = null, this.left = "\n", this.links = [], this.linkMap = {}, this.unhandled = {}, "object" != typeof this.options && (this.options = {});
      for (j in a)o.call(a, j) && (d = a[j], "undefined" == typeof this.options[j] && (this.options[j] = d));
      this.win = "undefined" != typeof window && null !== window ? window : null, null == this.win && (e = require("jsdom").jsdom(null, null, {features: {FetchExternalResources: !1}, url: this.options.base}), this.win = e.createWindow()), null == this.win.Node && (this.win.Node = {ELEMENT_NODE: 1, TEXT_NODE: 3})
    }

    return b.prototype.append = function(a) {
      return null != this.last && (this.buffer += this.last), this.last = a
    }, b.prototype.attr = function(a, b, c) {
      var d;
      return null == c && (c = !0), d = c || "function" != typeof a.getAttribute ? a[b] : a.getAttribute(b), null != d ? d : ""
    }, b.prototype.br = function() {
      return this.append("  " + this.left), this.atLeft = this.atNoWS = !0
    }, b.prototype.code = function() {
      var a, b = this;
      return a = this.inCode, this.inCode = !0, function() {
        return b.inCode = a
      }
    }, b.prototype.has = function(a, b, c) {
      return null == c && (c = !0), c || "function" != typeof a.hasAttribute ? a.hasOwnProperty(b) : a.hasAttribute(b)
    }, b.prototype.inCodeProcess = function(a) {
      return a.replace(/`/g, "\\`")
    }, b.prototype.isVisible = function(a) {
      var b, c, d, e, h, i, j, k, l;
      if (h = this.attr(a, "style", !1), d = null != h ? "function" == typeof h.match ? h.match(f) : void 0 : void 0, j = !0, null != d)for (k = 0, l = d.length; l > k; k++)e = d[k], j = !g.test(e);
      if (j && "function" == typeof this.win.getComputedStyle)try {
        h = this.win.getComputedStyle(a, null), "function" == typeof(null != h ? h.getPropertyValue : void 0) && (b = h.getPropertyValue("display"), i = h.getPropertyValue("visibility"), j = "none" !== b && "hidden" !== i)
      } catch (m) {
        c = m, this.thrown(c, "getComputedStyle")
      }
      return j
    }, b.prototype.li = function() {
      var a;
      return a = this.inOrderedList ? "" + this.order++ + ". " : "* ", a = l(a, 2 * (this.listDepth - 1)), this.append(a)
    }, b.prototype.nonPreProcess = function(a) {
      var b;
      a = a.replace(/\n([ \t]*\n)+/g, "\n"), a = a.replace(/\n[ \t]+/g, "\n"), a = a.replace(/[ \t]+/g, " ");
      for (j in e)o.call(e, j) && (b = e[j], a = a.replace(d[j], b));
      return a
    }, b.prototype.ol = function() {
      var a, b, c = this;
      return 0 === this.listDepth && this.p(), a = this.inOrderedList, b = this.order, this.inOrderedList = !0, this.order = 1, this.listDepth++, function() {
        return c.inOrderedList = a, c.order = b, c.listDepth--
      }
    }, b.prototype.output = function(a) {
      return a && (this.inPre || (a = this.atNoWS ? a.replace(/^[ \t\n]+/, "") : /^[ \t]*\n/.test(a) ? a.replace(/^[ \t\n]+/, "\n") : a.replace(/^[ \t]+/, " ")), "" !== a) ? (this.atP = /\n\n$/.test(a), this.atLeft = /\n$/.test(a), this.atNoWS = /[ \t\n]$/.test(a), this.append(a.replace(/\n/g, this.left))) : void 0
    }, b.prototype.outputLater = function(a) {
      var b = this;
      return function() {
        return b.output(a)
      }
    }, b.prototype.p = function() {
      return this.atP ? void 0 : (this.atLeft || (this.append(this.left), this.atLeft = !0), this.append(this.left), this.atNoWS = this.atP = !0)
    }, b.prototype.parse = function() {
      var a, b, c, d, e, f, g, h;
      if (this.buffer = "", !this.html)return this.buffer;
      if (a = this.win.document.createElement("div"), "string" == typeof this.html ? a.innerHTML = this.html : a.appendChild(this.html), this.process(a), this.links.length)for (this.append("\n\n"), h = this.links, b = f = 0, g = h.length; g > f; b = ++f)c = h[b], c && this.append("[" + b + "]: " + c + "\n");
      return this.options.debug && (e = function() {
        var a, b;
        a = this.unhandled, b = [];
        for (d in a)o.call(a, d) && b.push(d);
        return b
      }.call(this).sort(), console.log(e.length ? "Ignored tags;\n" + e.join(", ") : "No tags were ignored"), console.log(this.exceptions.length ? "Exceptions;\n" + this.exceptions.join("\n") : "No exceptions were thrown")), this.append(""), this.buffer = n(this.buffer)
    }, b.prototype.pre = function() {
      var a, b = this;
      return a = this.inPre, this.inPre = !0, function() {
        return b.inPre = a
      }
    }, b.prototype.process = function(a) {
      var b, c, d, e, f, g, j, k, l, m, n, o, p, q, r, s, t, u, v;
      if (this.isVisible(a)) {
        if (a.nodeType === this.win.Node.ELEMENT_NODE) {
          l = !1;
          try {
            if (h.test(a.tagName))l = !0; else if (/^H[1-6]$/.test(a.tagName))k = parseInt(a.tagName.match(/([1-6])$/)[1]), this.p(), this.output("" + function() {
              var a, b;
              for (b = [], j = a = 1; k >= 1 ? k >= a : a >= k; j = k >= 1 ? ++a : --a)b.push("#");
              return b
            }().join("") + " "); else if (i.test(a.tagName))this.p(); else switch (a.tagName) {
              case"BODY":
              case"FORM":
                break;
              case"DETAILS":
                this.p(), this.has(a, "open", !1) || (l = !0, o = a.getElementsByTagName("summary")[0], o && this.process(o));
                break;
              case"BR":
                this.br();
                break;
              case"HR":
                this.p(), this.output("---"), this.p();
                break;
              case"CITE":
              case"DFN":
              case"EM":
              case"I":
              case"U":
              case"VAR":
                this.output("*"), this.atNoWS = !0, b = this.outputLater("*");
                break;
              case"DT":
              case"B":
              case"STRONG":
                "DT" === a.tagName && this.p(), this.output("**"), this.atNoWS = !0, b = this.outputLater("**");
                break;
              case"Q":
                this.output('"'), this.atNoWS = !0, b = this.outputLater('"');
                break;
              case"OL":
              case"UL":
                b = "OL" === a.tagName ? this.ol() : this.ul();
                break;
              case"LI":
                this.replaceLeft("\n"), this.li();
                break;
              case"PRE":
                $('.highlight').each(function(index, element) {
                  var language = $(this).find('code').attr('class');
                  var text = $(this).text();
                  $(this).text('{% highlight ' + language + ' %}\n' + text + '\n{% endhighlight %}');
                });
                break;
              case"CODE":
              case"KBD":
              case"SAMP":
                if (this.inPre)break;
                this.output("`"), c = this.code(), d = this.outputLater("`"), b = function() {
                  return c(), d()
                };
                break;
              case"BLOCKQUOTE":
              case"DD":
                b = this.pushLeft("> ");
                break;
              case"A":
                if (g = this.attr(a, "href", this.options.absolute), !g)break;
                p = this.attr(a, "title"), p && (g += ' "' + p + '"'), n = this.options.inline ? "(" + g + ")" : "[" + (null != (t = (q = this.linkMap)[g]) ? t : q[g] = this.links.push(g) - 1) + "]", this.output("["), this.atNoWS = !0, b = this.outputLater("]" + n);
                break;
              case"IMG":
                if (l = !0, m = this.attr(a, "src", this.options.absolute), !m)break;
                this.output("![" + this.attr(a, "alt") + "](" + m + ")");
                break;
              case"FRAME":
              case"IFRAME":
                l = !0;
                try {
                  (null != (u = a.contentDocument) ? u.documentElement : void 0) && this.process(a.contentDocument.documentElement)
                } catch (w) {
                  f = w, this.thrown(f, "contentDocument")
                }
                break;
              case"TR":
                b = this.p;
                break;
              default:
                this.options.debug && (this.unhandled[a.tagName] = null)
            }
          } catch (w) {
            f = w, this.thrown(f, a.tagName)
          }
          if (!l)for (v = a.childNodes, r = 0, s = v.length; s > r; r++)e = v[r], this.process(e);
          return null != b ? b.call(this) : void 0
        }
        return a.nodeType === this.win.Node.TEXT_NODE ? this.output(this.inPre ? a.nodeValue : this.inCode ? this.inCodeProcess(a.nodeValue) : this.nonPreProcess(a.nodeValue)) : void 0
      }
    }, b.prototype.pushLeft = function(a) {
      var b, c = this;
      return b = this.left, this.left += a, this.atP ? this.append(a) : this.p(), function() {
        return c.left = b, c.atLeft = c.atP = !1, c.p()
      }
    }, b.prototype.replaceLeft = function(a) {
      return this.atLeft ? this.last ? this.last = this.last.replace(/[ ]{2,4}$/, a) : void 0 : (this.append(this.left.replace(/[ ]{2,4}$/, a)), this.atLeft = this.atNoWS = this.atP = !0)
    }, b.prototype.thrown = function(a, b) {
      return this.options.debug ? this.exceptions.push("" + b + ": " + a) : void 0
    }, b.prototype.ul = function() {
      var a, b, c = this;
      return 0 === this.listDepth && this.p(), a = this.inOrderedList, b = this.order, this.inOrderedList = !1, this.order = 1, this.listDepth++, function() {
        return c.inOrderedList = a, c.order = b, c.listDepth--
      }
    }, b
  }(), this.md = k = function(a, c) {
    return new b(a, c).parse()
  }, ("undefined" != typeof module && null !== module ? module.exports : void 0) ? module.exports = k : "function" == typeof define && define.amd && define("md", function() {
    return k
  }), k.version = k.VERSION = "3.0.2", k.noConflict = function() {
    return p.md = c, k
  }
}).call(this);