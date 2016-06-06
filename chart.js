var Chart = function (el, options) {
	var el = $(el);
	var container = el.find('.data_box')
		.eq(0);
	var coordinate = el.find('.chart_coordinate')
		.eq(0);
	var totalWidth = 0;
	var totalHeight = 0;


	//获取最大值
	var getMax = function (options) {
		var arr = [];
		for (var i = 0, len = options.data.length; i < len; i++) {
			arr.push.apply(arr, options.data[i].data);
			if (i === len - 1) {
				var curMax = options.coordinate.max;
				Array.max = function (array) {
					return Math.max.apply(Math, array);
				};
				curMax = Math.max(curMax, Array.max(arr));
				curMax = curMax * 1.2;
				return curMax;
			}
		}
	};

	var MAXNUM = getMax(options);

	//获取高度
	var getHeight = function (max, x) {
		var unitHeight = totalHeight / max;
		var height = x * unitHeight;
		return height;
	};

	//计算间距
	var getDistance = function (len, x1, x2, max) {
		var x = totalWidth / len;
		var y = (x1 - x2) * totalHeight / max;

		return Math.sqrt(x * x + y * y);
	};

	//获取旋转角度
	var getAngle = function (len, x1, x2, max) {
		var x = totalWidth / len;
		var y = (x1 - x2) * totalHeight / max;
		var z = Math.sqrt(x * x + y * y);
		var rotat = Math.round((Math.asin(y / z) / Math.PI * 180)); //得到的角度

		return rotat;
	};

	//添加Y轴坐标
	var addCoordinate = function (options) {
		var tpl = '';
		var len = options.coordinate.count;
		var unit = options.coordinate.unit;
		var scale = Math.round(MAXNUM / len);
		var title = options.coordinate.title;
		for (var i = 0; i <= len; i++) {
			tpl += '<li><span>' + scale * i + unit + '</span></li>';
			if (i === len) {
				if (title) {
					tpl += '<li><span>' + title + '</span></li>';
				}
				coordinate.append(tpl);
			}
		}
	};

	//添加X轴坐标
	var addX = function (options) {
		var len = options.title.length;
		var tpl = '';
		for (var i = 0; i < len; i++) {
			// var curHeight = getHeight(options.max, options.data[i]);
			tpl += '<li class="chart_item">' + options.title[i] + '</li>';
			if (i === len - 1) {
				el.find('.chartX')
					.html(tpl);
			}
		}
	};

	//添加条形图
	var addBar = function (options) {
		var len = options.data.length;
		var tpl = '';
		for (var i = 0; i < len; i++) {
			var curHeight = getHeight(MAXNUM, options.data[i]);
			tpl += '<li class="chart_item">' +
				'<span class="bar" style="background-color:' + options.color + ';height:' + curHeight + 'px;"></span>' +
				'</li>';
			if (i === len - 1) {
				container.append('<ul class="chart_data chart_bar">' + tpl + '</ul>');
			}
		}
	};

	//添加折线图
	var addLine = function (options) {
		var len = options.data.length;
		var tpl = '';
		for (var i = 0; i < len; i++) {

			var curHeight = getHeight(MAXNUM, options.data[i]);

			if (i === len - 1) {
				tpl += '<li class="chart_item">' +
					'<span class="dot"  style="background-color:' + options.color + ';bottom:' + curHeight + 'px;"></span></li>';
				container.append('<ul class="chart_data chart_line">' + tpl + '</ul>');
			} else {
				var curDeg = getAngle(len, options.data[i], options.data[i + 1], MAXNUM);
				var curWidth = getDistance(len, options.data[i], options.data[i + 1], MAXNUM);
				tpl += '<li class="chart_item">' +
					'<span class="dot"  style="background-color:' + options.color + ';bottom:' + curHeight + 'px;">' +
					'<span class="line" style="background-color:' + options.color + ';transform: rotate(' + curDeg + 'deg);width: ' +
					curWidth + 'px;"></span></span>';
			}
		}
	};

	//渲染
	var render = function (options) {
		var len = options.data.length;
		var oHeight = container.height();

		//添加Y轴
		if (typeof options.coordinate !== 'undefined' && options.coordinate) {
			addCoordinate(options);
		}

		//添加图表
		for (var i = 0; i < len; i++) {
			var curData = options.data[i];
			//柱状图
			if (curData.type === 'bar') {
				addBar(curData);
			}
			//折线图
			if (curData.type === 'line') {
				addLine(curData);
			}
			//添加X轴
			if (curData.title && curData.title.length > 0) {
				addX(curData);
			}
		}
	};

	//重绘
	var repaint = function () {

	};

	//绑定事件
	var bind = function (options) {
		$(window)
			.resize(function (event) {
				console.log('需要重绘');
				var timer = setTimeout(function () {
					render(options);
					clearTimout(timer);
				}, 100);
			});
	};

	//初始化
	var init = function (options) {
		var len = options.data.length;
		if (len < 1) return;
		var size = 0;
		$(options.data)
			.each(function (index, el) {
				var cur = el.data.length;
				size = cur > size ? cur : size;
			});

		var curWidth = size <= 6 ? 100 : Math.round(size * 100 / 6);
		container.css({
			width: curWidth + '%'
		});

		el.find('.chartX')
			.css({
				width: curWidth + '%'
			});

		totalWidth = container.width();
		totalHeight = container.height();

		setTimeout(function () {
			render(options);
		}, 10);
	};

	init(options);

	var that = {};

	// 增加
	that.add = function (options) {
		render(options);
	};

	return that;
};
