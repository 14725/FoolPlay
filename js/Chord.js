var Chord = {};
/* 打过补丁的 感知器 + HMM(忽略起始矩阵) */
/* TODO: 训练它而非胡诌数据 */
Chord.vec = {
  noteToChord: {
    C: [0.1, 1, 0, 1, 0, 1, 0, 0],
    D: [0.1, 0, 1, 0, 1, 0, 1, 0],
    E: [0.1, 0, 0, 1, 0, 1, 0, 1],
    F: [0.1, 1, 0, 0, 1, 0, 1, 0],
    G: [0.1, 0, 1, 0, 0, 1, 0, 1],
    A: [0.1, 1, 0, 1, 0, 0, 1, 0],
    B: [0.1, 0, 1, 0, 1, 0, 0, 1]
  },
  chordToChord: {
    C: {
      C: 0.211917124,
      D: 0.112338266,
      E: 0.077596617,
      F: 0.20553742,
      G: 0.222942916,
      A: 0.1221852,
      B: 0.025033404
    },
    D: {
      C: 0.169779376,
      D: 0.13284592,
      E: 0.083601312,
      F: 0.119389545,
      G: 0.390091738,
      A: 0.08646437,
      B: 0.029632657
    },
    E: {
      C: 0.101129702,
      D: 0.139826275,
      E: 0.113097715,
      F: 0.163961766,
      G: 0.087565955,
      A: 0.363827569,
      B: 0.041888042
    },
    F: {
      C: 0.327259777,
      D: 0.106730018,
      E: 0.071609456,
      F: 0.112659463,
      G: 0.297840605,
      A: 0.068758761,
      B: 0.031357644
    },
    G: {
      C: 0.400843926,
      D: 0.061270188,
      E: 0.076128626,
      F: 0.137732711,
      G: 0.151422508,
      A: 0.142908122,
      B: 0.032638479
    },
    A: {
      C: 0.158233693,
      D: 0.247451897,
      E: 0.109546403,
      F: 0.166264586,
      G: 0.139411287,
      A: 0.154594694,
      B: 0.028233609
    },
    B: {
      C: 0.191762403,
      D: 0.081280003,
      E: 0.149418928,
      F: 0.149905635,
      G: 0.141144916,
      A: 0.127517131,
      B: 0.147958808
    }
  },
  chordToChordBetween: {
    C: {
      C: 0.211917124,
      D: 0.112338266,
      E: 0.077596617,
      F: 0.20553742,
      G: 0.222942916,
      A: 0.1221852,
      B: 0.025033404
    },
    D: {
      C: 0.169779376,
      D: 0.13284592,
      E: 0.083601312,
      F: 0.119389545,
      G: 0.390091738,
      A: 0.08646437,
      B: 0.029632657
    },
    E: {
      C: 0.101129702,
      D: 0.139826275,
      E: 0.113097715,
      F: 0.163961766,
      G: 0.087565955,
      A: 0.363827569,
      B: 0.041888042
    },
    F: {
      C: 0.327259777,
      D: 0.106730018,
      E: 0.071609456,
      F: 0.112659463,
      G: 0.297840605,
      A: 0.068758761,
      B: 0.031357644
    },
    G: {
      C: 0.400843926,
      D: 0.061270188,
      E: 0.076128626,
      F: 0.137732711,
      G: 0.151422508,
      A: 0.142908122,
      B: 0.032638479
    },
    A: {
      C: 0.158233693,
      D: 0.247451897,
      E: 0.109546403,
      F: 0.166264586,
      G: 0.139411287,
      A: 0.154594694,
      B: 0.028233609
    },
    B: {
      C: 0.191762403,
      D: 0.081280003,
      E: 0.149418928,
      F: 0.149905635,
      G: 0.141144916,
      A: 0.127517131,
      B: 0.147958808
    }
  }
};

/* 在没有能用的模型时候的经验补丁 */
/* “平滑”减少多余的转移 */
for(let i in Chord.vec.chordToChord){
  let sum = 0;
  for(let j in Chord.vec.chordToChord[i]){
    Chord.vec.chordToChord[i][j] += 0.6;
    sum += Chord.vec.chordToChord[i][j];
  }
  for(let j in Chord.vec.chordToChord[i]){
    Chord.vec.chordToChord[i][j] /= sum;
  }
}
for(let i in Chord.vec.chordToChordBetween){
  let sum = 0;
  Chord.vec.chordToChordBetween[i][i] += 0.4;
  for(let j in Chord.vec.chordToChordBetween[i]){
    Chord.vec.chordToChordBetween[i][j] += 1;
    sum += Chord.vec.chordToChordBetween[i][j];
  }
  for(let j in Chord.vec.chordToChordBetween[i]){
    Chord.vec.chordToChordBetween[i][j] /= sum;
  }
}

Chord.getVector = function chord_getVector(da) {
  var data = Util.clone(da);
  data = data.map(function (a) {
    /* 形状 */
    return a.map(function (b) {
      return b.note;
    });
  });
  Music.getLenSectionTempo();
  var processLength = Music.lenSection;
  switch (Music.tempo.join("/")) {
    case "4/4":
    case "8/6":
      processLength /= 2;
  }
  data = data.map(function (bar) {
    var temp = { vec: [0, 0, 0, 0, 0, 0, 0, 0], len: processLength };
    var ary = [];
    /* 检查是否有特别长的音：如果是，那么不宜切开 */
    var shouldContinue = false;
    var i;
    for (i = bar.length - 1; i >= 0; i--) {
      if (bar[i].length > processLength) {
        temp.len = Music.lenSection;
        break;
      }
    }
    /* 准备数组 */
    for (i = Music.lenSection / temp.len - 1; i >= 0; i--) {
      ary.push(Util.clone(temp));
    }
    var last;
    var left;
    for (i = 0; i < ary.length; i++) {
      left = ary[i].len;
      if (last) {
        ary[i].vec[+last.pitch] += last.length;
      }
      while (left > 0) {
        last = bar.shift();
        if (!last) break;
        if (last.length <= left) {
          ary[i].vec[+last.pitch] += last.length;
          left -= last.length;
          last = null;
        } else {
          last.length -= left;
          left = 0;
        }
      }
    }
    return ary;
  });
  return data;
};
Chord.chordList = {
  C: [1, 3, 5],
  D: [2, 4, 6],
  E: [3, 5, 7],
  F: [4, 6, 1],
  G: [5, 7, 2],
  A: [6, 1, 3],
  B: [7, 2, 4]
};

Chord.imme = function (lis,alter) {
  if(!alter){
    alter = {}
  }
  /* 1. 换算为比例 */
  var list = lis.map(function (sg) {
    var sum = sg.reduce(function (a, cur) {
      return a + cur;
    });
    return sg.map(function (val) {
      return val / sum;
    });
  });

  /* 2. 打分 */
  var tmpObj = Util.clone(Chord.chordList);
  var i, j, k;
  var node = { score: 0, prev: "C" };
  for (i in tmpObj) {
    tmpObj[i] = Util.clone(node);
  }
  var imme = list.map(function () {
    return Util.clone(tmpObj);
  });
  /* 单小节打分 */
  var sum;
  for (i in imme) {
    for (j in imme[i]) {
      for (k in Chord.vec.noteToChord[j]) {
        imme[i][j].score += list[i][k] * Chord.vec.noteToChord[j][k];
      }
    }
    sum = 0;
    for (j in imme[i]) {
      sum += imme[i][j].score;
    }
    for (j in imme[i]) {
      imme[i][j].score = Math.log(imme[i][j].score / sum);
    }
  }
  /* 相邻关系打分 */
  var maxItem, maxScore, tmpScore;
  var crdary;
  for (i = 2; i < imme.length; i++) {
    crdary = alter[i] ? Chord.vec.chordToChordBetween : Chord.vec.chordToChord ;
    for (j in imme[i]) {
      maxItem = "C";
      maxScore = -Infinity;
      for (k in imme[i]) {
        tmpScore =
          imme[i][j].score +
          imme[i - 1][k].score +
          Math.log(crdary[k][j]);

        if (tmpScore > maxScore) {
          maxItem = k;
          maxScore = tmpScore;
        }
      }
      imme[i][j].prev = maxItem;
      imme[i][j].score = maxScore;
    }
  }
  return imme;
};
Chord.match = function (lis,alter) {
  var imme = Chord.imme(Util.clone(lis),alter);
  var tmp = "";
  var maxVal = -Infinity;
  var i;
  /* 尝试猜测最后一个和弦 1. 结尾音*/
  for (i = lis.length - 1; i >= 0; i--) {
    if (lis[i][6] > lis[i][1]) {
      tmp = "A";
    } else if (lis[i][1] > lis[i][6]) {
      tmp = "C";
    } else {
      continue;
    }
    break;
  }
  /* 猜测和弦... 2. 最大分数 */
  if (tmp == "") {
    for (i in imme[imme.length - 1]) {
      if (imme[imme.length - 1][i].score > maxVal) {
        maxVal = imme[imme.length - 1][i].score;
        tmp = i;
      }
    }
  }
  var res = [];
  for (i = imme.length - 1; i >= 0; i--) {
    res.unshift(tmp);
    tmp = imme[i][tmp].prev;
  }
  return res;
};
Chord.keyToPitch = function (key) {};
Chord.getChord = function (bars) {
  bars = Music.flatBar();
  var barVecs = Chord.getVector(bars);
  var lists = barVecs.flat().map(function (a) {
    return a.vec;
  });
  
  var alter = {};
  barVecs.forEach(function(a){
    for(var i = 1; i< a.length; i++){
      a[i]._alter = true;
    }
  });
  barVecs.flat().forEach(function(a,i){
    if(a._alter ){
      alter[i] = true;
    }
  })
  var chordlist = Chord.match(lists,alter);
  barVecs.forEach(function (list) {
    list.forEach(function (onecd) {
      onecd.chord = chordlist.shift();
      onecd.chordnotes = Chord.chordList[onecd.chord];
    });
  });
  var result = barVecs.map(function (a) {
    var tmp = a.map(function (b) {
      return {
        chord: b.chord,
        chordnotes: b.chordnotes,
        len: b.len
      };
    });
    for (var i = 1; i < tmp.length; i++) {
      if (tmp[i - 1].chord == tmp[i].chord) {
        tmp[i - 1].len += tmp[i].len;
        tmp.splice(i--, 1);
      }
    }
    return tmp;
  });
  /*chordlist = result.flat().map(function(a){
    return a.chordnotes;
  });*/
  return result;
};

function 转换为C调() {
  var list = "CDEFGAB".split("");
  var d = list.indexOf(document.querySelector(".arpeggio").selectedOptions[0].innerHTML.replace(/[^A-G]/g, ""));
  var sec = chordinput.value.toUpperCase().replace(/[^A-G]/g, "").replace(/[A-G]/g, " $&").replace(/\s+/g, " ").trim();
  sec = sec.split(" ").slice(0, Music.sections.length);
  sec = sec.map(function (item) {
    return list[(list.indexOf(item) - d + list.length) % list.length];
  });
  chordinput.value = sec.join(" ");
}

function 标注(结果){
  document.querySelectorAll(".chord_it").forEach(function (a) {
      a.remove();
    });
    var doms = document.querySelectorAll('.measure');
  var ele;
  结果.forEach(function (it, id) {
    ele = document.createElement('div');
    ele.style.position = 'absolute';
    ele.style.marginTop = '-0.8em';
    ele.innerText = it;
    ele.className = "chord_it";
    doms[id].insertBefore(ele, doms[id].firstChild.nextSibling);
  });
}
function tagCur(){
  var res = Chord.getChord();
  res = res.map(function(a){
    return a.map((b) => (b.chord)).join('/')
  });
  标注(res)
}