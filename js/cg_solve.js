
'use strict'

var CGSolve = (function () {

  var EPSILON = 1e-20;

  function CSRMatrix(rows, row_ptrs, columns, column_ptrs, data) {
    this.rows = rows
    this.row_ptrs = row_ptrs
    this.columns = columns
    this.column_ptrs = column_ptrs
    this.data = data
  }

  var proto = CSRMatrix.prototype

  Object.defineProperty(proto, "rowCount", {
    get: function () {
      return this.rows[this.rows.length - 1]
    }
  })

  Object.defineProperty(proto, "columnCount", {
    get: function () {
      return this.columns[this.columns.length - 1]
    }
  })

  function applyImpl(rows, row_ptrs, columns, column_ptrs, data, vector, result) {
    var cptr = 0, dptr = 0, last_r = 0
    for (var i = 0, rlen = rows.length - 1; i < rlen; ++i) {
      var r = rows[i]
      var next_c = row_ptrs[i + 1]
      var s = 0.0
      while (++last_r < r) {
        result[last_r] = 0.0
      }
      while (cptr < next_c) {
        var c = columns[cptr]
        var next_d = column_ptrs[++cptr]
        while (dptr < next_d) {
          s += data[dptr++] * vector[c++]
        }
      }
      result[r] = s
    }
    var len = result.length
    while (++last_r < len) {
      result[last_r] = 0.0
    }
  }

  proto.apply = function (vector, result) {
    applyImpl(
      this.rows,
      this.row_ptrs,
      this.columns,
      this.column_ptrs,
      this.data,
      vector,
      result)
    return result
  }

  proto.transpose = function () {
    var items = this.toList()
    for (var i = 0; i < items.length; ++i) {
      var it = items[i]
      var tmp = it[0]
      it[0] = it[1]
      it[1] = tmp
    }
    return fromList(items, this.columnCount, this.rowCount)
  }

  proto.toList = function () {
    var result = []
    for (var i = 0, ilen = this.rows.length - 1; i < ilen; ++i) {
      var r = this.rows[i];
      for (var j = this.row_ptrs[i], jlen = this.row_ptrs[i + 1]; j < jlen; ++j) {
        var c = this.columns[j]
        for (var k = this.column_ptrs[j], klen = this.column_ptrs[j + 1]; k < klen; ++k) {
          var d = this.data[k]
          result.push([r, c++, d])
        }
      }
    }
    return result
  }

  proto.toDense = function () {
    var result = dup([this.rowCount, this.columnCount], 0.0)
    for (var i = 0, ilen = this.rows.length - 1; i < ilen; ++i) {
      var r = this.rows[i];
      for (var j = this.row_ptrs[i], jlen = this.row_ptrs[i + 1]; j < jlen; ++j) {
        var c = this.columns[j]
        for (var k = this.column_ptrs[j], klen = this.column_ptrs[j + 1]; k < klen; ++k) {
          var d = this.data[k]
          result[r][c++] = d
        }
      }
    }
    return result
  }

  function compareKey(a, b) {
    return (a[0] - b[0]) || (a[1] - b[1])
  }

  function removeDuplicates(items, nrows, ncols) {
    var i = 0, ptr = 0
    items.sort(compareKey)
    while (i < items.length) {
      var it = items[i++]
      if (it[0] >= nrows || it[1] >= ncols) {
        continue
      }
      while (i < items.length && compareKey(items[i], it) === 0) {
        it[2] += items[i++][2]
      }
      if (Math.abs(it[2]) > EPSILON) {
        items[ptr++] = it
      }
    }
    items.length = ptr
    return items
  }

  function fromList(items, nrows, ncols) {
    items = removeDuplicates(items, nrows || Infinity, ncols || Infinity)
    var rows = []
      , row_ptrs = []
      , cols = []
      , col_ptrs = []
      , data = new Float64Array(items.length)
    nrows = nrows || 0
    ncols = ncols || 0
    for (var i = 0; i < items.length; ++i) {
      var item = items[i]
      if (i === 0 || item[0] !== items[i - 1][0]) {
        rows.push(item[0])
        row_ptrs.push(cols.length)
        cols.push(item[1])
        col_ptrs.push(i)
      } else if (item[1] !== items[i - 1][1] + 1) {
        cols.push(item[1])
        col_ptrs.push(i)
      }
      nrows = Math.max(nrows, item[0] + 1)
      ncols = Math.max(ncols, item[1] + 1)
      data[i] = item[2]
    }
    rows.push(nrows)
    row_ptrs.push(cols.length)
    cols.push(ncols)
    col_ptrs.push(data.length)
    return new CSRMatrix(
      new Uint32Array(rows),
      new Uint32Array(row_ptrs),
      new Uint32Array(cols),
      new Uint32Array(col_ptrs),
      data)
  }

  function fromDictionary(dict, rows, cols) {
    return fromList(Object.keys(dict).map(function (item) {
      var parts = item.split(',')
      return [parts[0] | 0, parts[1] | 0, dict[item]]
    }), rows, cols)
  }

  function fromDense(matrix) {
    var list = []
    var rows = matrix.length
    if (rows === 0) {
      return fromList([], 0, 0)
    }
    var cols = matrix[0].length
    for (var i = 0; i < rows; ++i) {
      var row = matrix[i]
      for (var j = 0; j < cols; ++j) {
        var v = row[j]
        if (Math.abs(v) > EPSILON) {
          list.push([i, j, v])
        }
      }
    }
    return fromList(list, rows, cols)
  }

  return {
    Matrix: CSRMatrix,
    createFromDense: fromDense,
    createFromLis: fromList,
    solveCG: (A, Afull, b, x, tolerance, max_iter) => {
      var abs = Math.abs
        , max = Math.max
        , EPSILON = 1e-20
        , n = A.rowCount
        , i, j, k
        , alpha_n, alpha_d, alpha, beta, rnorm, s;

      var R = new Float64Array(1024);
      var P = new Float64Array(1024);
      var D = new Float64Array(1024);
      var Z = new Float64Array(1024);

      function reserve(n) {
        if (n < R.length) {
          return
        }
        let nsize = 2048;
        while (nsize < n) {
          nsize *= 2;
        }
        R = new Float64Array(nsize)
        P = new Float64Array(nsize)
        Z = new Float64Array(nsize)
        D = new Float64Array(nsize)
      }

      if (!tolerance) {
        tolerance = 1e-10;
      }
      if (!max_iter) {
        max_iter = Math.min(n, 1000);
      }
      if (!x) {
        if (b.buffer) {
          x = new b.constructor(b.buffer.slice(0));
        } else {
          x = b.slice(0);
        }
      }
      reserve(n);
      //Compute preconditioner
      for (i = 0; i < n; ++i) {
        s = Afull.get([i, i]);
        if (abs(s) > EPSILON) {
          D[i] = 1.0 / s;
        } else {
          D[i] = 1.0;
        }
      }
      //Initialize
      A.apply(x, R);
      for (i = 0; i < n; ++i) {
        R[i] = b[i] - R[i];
        Z[i] = D[i] * R[i];
        P[i] = Z[i];
      }
      //Iterate
      for (k = 0; k < max_iter; ++k) {
        alpha_n = 0.0;
        for (i = 0; i < n; ++i) {
          alpha_n += R[i] * Z[i];
        }
        A.apply(P, Z);
        alpha_d = 0.0;
        for (i = 0; i < n; ++i) {
          alpha_d += P[i] * Z[i];
        }
        alpha = alpha_n / alpha_d;
        beta = 0.0;
        rnorm = 0.0;
        for (i = 0; i < n; ++i) {
          x[i] += alpha * P[i];
          R[i] -= alpha * Z[i];
          Z[i] = D[i] * R[i];
          beta += R[i] * Z[i];
          rnorm = max(rnorm, abs(R[i]));
        }
        if (k % 100 == 0) print(`${k}: rnorm = ${rnorm}`);
        if (rnorm < tolerance) {
          print(`${k}: rnorm = ${rnorm}`);
          break;
        }
        beta /= alpha_n;
        for (i = 0; i < n; ++i) {
          P[i] = Z[i] + beta * P[i];
        }
        if (k == max_iter - 1) {
          print(`Final iteration ${k}: rnorm = ${rnorm}`);
        }
      }
      return x;
    }
  }
})();