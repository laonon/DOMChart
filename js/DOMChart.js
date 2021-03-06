var Chart = function(options) {
	var myConfig = {
		container: $(document.body), //图表容器
		axisX: {
			has: true, //X轴
			scroll: true,
			data: [],
		},
		axisY: {
			has: true, //Y轴
			// tofix: 1, //保留小数点
			// title: '',
			min: 0,
			unit: '',
			count: 3,
			title: ''
				// type:
		},
		data: [], //渲染数据
	};

	var container = myConfig.container;
	var MAXNUM = 0;
	var MINNUM = 0;
	var totalWidth = 0;
	var totalHeight = 0;
	var lineArr = [];
	var barArr = [];
	var titleArr = [];

	var unitFn = {
		getUnitHeight: function(max) {
			if (myConfig.axisY.min === 1) {
				return totalHeight / (max - MINNUM);
			} else {
				return totalHeight / max;
			}
		},
		//获取高度
		getHeight: function(max, x) {
			if(max == 0) return 0;
			var unitHeight = unitFn.getUnitHeight(max);
			var h;
			if (myConfig.axisY.min === 1) {
				var minHeight = MINNUM * unitHeight;
				h = x * unitHeight - minHeight;
			} else {
				h = x * unitHeight;
			}
			return h;
		},
		//获取间距
		getDistance: function(len, x1, x2, max) {
			var x = totalWidth / len;
			var y = unitFn.getHeight(max, x1) - unitFn.getHeight(max, x2);
			if(x1 == 0 && x2 == 0){
				return x;
			}
			return Math.sqrt(x * x + y * y);
		},
		//获取角度
		getAngle: function(len, x1, x2, max) {
			var x = totalWidth / len;
			var y = (x1 - x2) * unitFn.getUnitHeight(max);
			var z = Math.sqrt(x * x + y * y);
			var rotate = Math.asin(y / z) / Math.PI * 180; //得到的角度

			return rotate;
		},
		//获取最大值
		getMax: function(type) {
			var arr = [];
			for (var i = 0, len = myConfig.data.length; i < len; i++) {

				if (myConfig.data[i].type === type) {
					arr.push.apply(arr, myConfig.data[i].data);
				}

				if (type === undefined) {
					arr.push.apply(arr, myConfig.data[i].data);
				}

				if (i === len - 1) {
					// var curMax = myConfig.axisY.data.max;
					Array.max = function(array) {
						return Math.max.apply(Math, array);
					};
					var curMax = Array.max(arr);
					curMax = curMax * 1.08;

					return curMax;
				}
			}
		},
		//获取最小值
		getMin: function() {
			var arr = [];
			for (var i = 0, len = myConfig.data.length; i < len; i++) {
				arr.push.apply(arr, myConfig.data[i].data);
				if (i === len - 1) {
					Array.min = function(array) {
						return Math.min.apply(Math, array);
					};
					return Array.min(arr) * 0.98;
				}
			}
		}
	};

	var eventHandle = {
		//添加Y轴坐标
		addAxisY: function(data) {
			var tpl = '';
			var len = data.count;
			var unit = data.unit;
			var MAXNUM = unitFn.getMax(data.type);
			var max = data.min && data.min === 1 ? (MAXNUM - MINNUM) / len : MAXNUM / len;
			var scale;
			var tofix = data.tofix;
			if (tofix) {
				scale = max.toFixed(tofix);
			} else {
				scale = Math.round(max);
			}

			if (data.min && data.min === 1) { //Y轴坐标不从0开始
				var minY = MINNUM;
				for (var i = 0; i <= len; i++) {
					var curUnit = MINNUM + scale * i;
					if (tofix) {
						curUnit = curUnit.toFixed(tofix);
					}
					tpl += '<li><span>' + curUnit + unit + '</span></li>';
					if (i === len) {
						if (data.title && data.title !== '') {
							tpl += '<li class="title"><span>' + data.title + '</span></li>';
						}
						return tpl;
					}
				}
			} else {
				for (var i = 0; i <= len; i++) {
					var curUnit = scale * i;
					if (tofix) {
						curUnit = curUnit.toFixed(tofix);
					}
					tpl += '<li><span>' + curUnit + unit + '</span></li>';
					if (i === len) {
						if (data.title) {
							tpl += '<li class="title"><span>' + data.title + '</span></li>';
						}
						return tpl;
					}
				}
			}
		},
		//添加X轴坐标
		addAxisX: function(data) {
			var len = data.length;
			var tpl = '';
			for (var i = 0; i < len; i++) {
				tpl += '<li class="chart_item">' + data[i] + '</li>';
				if (i === len - 1) {
					return tpl;
				}
			}
		},
		//添加柱状图
		addBar: function(data) {
			var len = data.data.length;
			var max = unitFn.getMax(data.type);
			// console.log('barmax:'+max);
			for (var i = 0; i < len; i++) {
				var curData = data.data[i] || 0;
				var curHeight = unitFn.getHeight(max, curData);
				if (barArr[i] === undefined) {
					barArr[i] = '';
				}
				var tpl = '<span class="bar" data-info="' + data.title + ':' + curData + data.unit + '" style="background-color:' + data.color + ';height:' + curHeight + 'px;"></span>';
				barArr[i] += tpl;
			}
		},
		//添加折线图
		addLine: function(data) {
			var len = data.data.length;
			var max = unitFn.getMax(data.type);
			// console.log('linemax:'+max);
			for (var i = 0; i < len; i++) {
				var curData = data.data[i] || 0;
				var nextData = data.data[i + 1] || 0;
				var curHeight = unitFn.getHeight(max, curData);
				var tpl = '';
				if (lineArr[i] === undefined) {
					lineArr[i] = '';
				}
				if (i === len - 1) {
					tpl = '<span class="dot" data-info="' + data.title + ':' + curData + data.unit + '" style="background-color:' + data.color + ';bottom:' + curHeight + 'px;"></span>';
				} else {
					var curDeg = unitFn.getAngle(len, curData, nextData, max);
					var curWidth = unitFn.getDistance(len, curData, nextData, max);
					tpl = '<span class="dot" data-info="' + data.title + ':' + curData + data.unit + '" style="background-color:' + data.color + ';bottom:' + curHeight + 'px;">' +
						'<span class="line" style="background-color:' + data.color + ';-webkit-transform: rotate(' + curDeg + 'deg);transform: rotate(' + curDeg + 'deg);width: ' + curWidth + 'px;"></span></span>';
				}
				lineArr[i] += tpl;
			}
		},
		//添加标识
		addSign: function(data) {
			// var unit = data.unit ? '(' + data.unit + ')' : '';
			var tpl = '<span class="sign_item"><i class="sign ' + data.type + '" style="background:' + data.color + ';"></i><span class="sign_txt">' + data.title + '</span></span>';
			titleArr.push(tpl);
		},
		//点击显示当前信息
		showInfo: function(event) {
			var _this = this;
			var tip = container.find('.tip');
			var nodes = $(_this).find('.bar,.dot');
			var oWidth = container.width();

			var str = '';
			for (var i = 0, len = nodes.length; i < len; i++) {
				var arrTip = nodes.eq(i).attr('data-info').split(':');
				str += '<em>' + arrTip[0] + '：</em><span>' + arrTip[1] + '</span>' + '<br>';
			}
			if (tip.length > 0) {
				tip.html(str);
			} else {
				tip = $('<div class="tip">' + str + '</div>').appendTo(container);
			}
			var tipWidth = tip.width() || oWidth / 3;
			var tipHeight = tip.height() || oWidth / 3;

			var x = _this.offsetLeft + parseInt($(document.documentElement).css('font-size')) || 0;
			var y = _this.offsetTop + parseInt($(document.documentElement).css('font-size')) || 0;
			x = x > (oWidth - tipWidth) ? oWidth - tipWidth : x;
			y = y > (totalHeight - tipHeight) ? totalHeight - tipHeight : y;
			$(_this).siblings('.chart_item').removeClass('choosed');
			$(_this).addClass('choosed');

			tip.css({
				left: x + 'px',
				top: y + 'px'
			});

			$(document).on('tap', function(event) {
				var target = $(event.target);
				if (!target.is('.chart_box') && target.closest('.chart_box').length < 1) {
					$(_this).removeClass('choosed');
					tip && tip.remove();
				}
			});
		}
	};

	var private = {
		'init': function(config) {
			private.initParam(config);
			private.initRender();
			private.initEvent();
		},
		'initParam': function(config) {
			if (config) {
				$.extend(myConfig, config);
			}
		},
		'initRender': function() {
			var cfg = myConfig;
			container = cfg.container;

			if (cfg.data.length < 1) return;

			lineArr = [];
			barArr = [];
			titleArr = [];

			var maxLength = 0;
			for (var i = 0, len = cfg.data.length; i < len; i++) {
				var curData = cfg.data[i];
				maxLength = Math.max(maxLength, curData.data.length);
			}
			var ratio = (maxLength <= 6 || !cfg.axisX.scroll) ? 1 : maxLength / 6;
			var scrollWidth = Math.round(ratio * 100);
			totalWidth = (container.width() - parseInt($(document.documentElement).css('font-size')) * 2)*scrollWidth/100;
			totalHeight = container.height();

			MAXNUM = unitFn.getMax();
			if (cfg.axisY.min === 1) {
				MINNUM = unitFn.getMin();
			}

			if (cfg.axisX.has) {
				var tplX = eventHandle.addAxisX(cfg.axisX.data);
			}

			if (cfg.axisY.has) {
				var tplY = eventHandle.addAxisY(cfg.axisY);
			}

			for (var i = 0, len = cfg.data.length; i < len; i++) {
				var curData = cfg.data[i];

				if (len > 1 || cfg.axisY.title == '') {
					eventHandle.addSign(curData);
					container.css({
						margin: '2rem 0 4rem'
					});
				} else {
					container.css({
						margin: '3rem 0 2rem'
					});
				}
				switch (curData.type) {
					case 'bar':
						eventHandle.addBar(curData);
						break;
					case 'line':
						eventHandle.addLine(curData);
				}
			}


			var tplLi = '';
			for (var j = 0; j < maxLength; j++) {
				var strLine = lineArr[j] || '';
				var strBar = barArr[j] || '';
				tplLi += '<li class="chart_item">' + strBar + strLine + '</li>';
				if (j == maxLength - 1) {
					var tpl = '<ul class="chartY">' + tplY + '</ul>' +
						'<div class="sign_box">' + titleArr.join('') + '</div>' +
						'<div class="scroll">' +
						'<div class="data_box" style="width:' + scrollWidth + '%;"><ul class="chart_data">' + tplLi + '</ul></div>' +
						'<div class="title_box" style="width:' + scrollWidth + '%;"><ul class="chartX">' + tplX + '</ul></div>' +
						'</div>';
					container.html(tpl);
				}
			}
		},
		'initEvent': function() {
			container.on('click', '.data_box .chart_item', eventHandle.showInfo);
			//重绘
			$(window).resize(function(event) {
				setTimeout(function() {
					private.init(options);
				}, 1000 / 60);
			});
		}
	};

	private.init(options);

	var pub = {};

	// 增加
	pub.add = function(options) {};

	return pub;
};
