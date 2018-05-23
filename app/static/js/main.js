const $dloadBtn = document.querySelector('.canvas__dloadBtn');
const $picInfo = document.querySelector('.canvas__picInfo');
const $canvas = document.getElementById('canvas');
const $ctrlQuality = document.querySelector('.canvas__qualityChange');
const $ctrlFType = document.querySelectorAll('.canvas__fType');
const $canvasQlty = document.querySelector('.canvas__quality');
const $canvasQltyVal = document.querySelector('.canvas__qualityVal');

let dloadFType = 'png';
let dloadQlty = 0.92;

const drawBlur = (canvas, bg, img) => {
	// Store the width and height of the canvas for below
	const w = canvas.width;
	const h = canvas.height;
	const arCanv = w / h;
	const arImg = img.w / img.h;
	const scaleFactor = 1.2;
	const canvasContext = canvas.getContext('2d');

	let wFin, hFin, dy, dx;
	if (arCanv > arImg) {
		wFin = w;
		hFin = w / arImg;
	} else {
		hFin = h;
		wFin = arImg * h;
	}

	dy = (h - hFin * scaleFactor) / 2;
	dx = (w - wFin * scaleFactor) / 2;

	// canvasContext.scale(scaleFactor, scaleFactor);
	// This draws the image we just loaded to our canvas

	canvasContext.filter = 'blur(0px)';
	canvasContext.drawImage(bg, dx, dy, wFin * scaleFactor, hFin * scaleFactor);

	canvasContext.filter = 'blur(30px)';
	canvasContext.drawImage(bg, dx, dy, wFin * scaleFactor, hFin * scaleFactor);

	// This blurs the contents of the entire canvas
	// stackBlurCanvasRGBA('heroCanvas', 0, 0, w, h, 100);
};
const drawNormal = (canvas, bg, img) => {
	// Store the width and height of the canvas for below
	const w = canvas.width;
	const h = canvas.height;
	const arCanv = w / h;
	const arImg = img.w / img.h;
	const canvasContext = canvas.getContext('2d');

	let wFin, hFin, dy, dx;
	if (arCanv > arImg) {
		hFin = h;
		wFin = arImg * h;
		dx = (w - wFin) / 2;
		dy = 0;
	} else {
		wFin = w;
		hFin = w / arImg;
		dx = 0;
		dy = (h - hFin) / 2;
	}

	canvasContext.scale(1, 1);
	canvasContext.filter = 'blur(0px)';
	canvasContext.drawImage(bg, dx, dy, wFin, hFin);
	document.querySelector('.canvas__result').classList.remove('d-none');
};
/**
 * embed to canvas
 */

const embedToCanvas = (src, w, h) => {
	$canvas.width = w;
	$canvas.height = h;
	const canvasContext = $canvas.getContext('2d');
	const canvasBackground = new Image();
	canvasBackground.src = src;
	canvasBackground.onload = function() {
		const img = {
			w: this.width,
			h: this.height,
		};
		drawBlur($canvas, canvasBackground, img);
		drawNormal($canvas, canvasBackground, img);
		updateSize();
		compress($canvas, dloadFType, dloadQlty);
	};
};

const handleFileSelect = (files, w, h) => {
	const f = files[0];
	const reader = new FileReader();

	reader.onload = (theFile => e => {
		embedToCanvas(e.target.result, w, h);
	})(f);

	reader.readAsDataURL(f);
};

const downloadCanvas = (e, fType = dloadFType, qlty = dloadQlty) => {
	const link = e.target;
	const { width, height } = $canvas;
	const href = $canvas.toDataURL(`image/${fType}`, Number(qlty));
	$picInfo.innerHTML = `${href.length * 3 / (4 * 1024)}KB`;

	link.href = href;
	link.download = `banner__${width}-${height}.${fType}`;
};

const updateSize = (fType = 'png', qlty = 0.92) => {
	const href = $canvas.toDataURL(`image/${fType}`, Number(qlty));
	const size = `${href.length * 3 / (4 * 1024)}KB`;
	$picInfo.innerHTML = size;
};

const updatefType = fType => {
	updateSize(fType, dloadQlty);
	dloadFType = fType;
};

const updateQlty = qlty => {
	updateSize(dloadFType, qlty);
	dloadQlty = qlty;
};

$dloadBtn.addEventListener('click', e => {
	downloadCanvas(e);
});

$ctrlQuality.addEventListener('input', e => {
	const { value } = e.target;
	$canvasQltyVal.innerHTML = value;
	updateQlty(value);
});

$ctrlFType.forEach(el => {
	el.addEventListener('change', e => {
		const { value } = e.target;
		if (value === 'png') {
			$canvasQlty.classList.add('d-none');
		} else {
			$canvasQlty.classList.remove('d-none');
		}
		updatefType(value);
	});
});

let form;
if (window.FileReader) {
	form = document.getElementById('upload_form');

	form.onsubmit = e => {
		e.preventDefault();
		const formData = new FormData(form);
		const width = formData.get('width');
		const height = formData.get('height');
		handleFileSelect(e.target[0].files, width, height);
	};
} else {
	document.write('This browser does not support FileReader');
}

const compress = (canvas, fType, qlty) => {
	const uri = canvas.toDataURL();
	// let blob;
	// canvas.toBlob(
	// 	b => {
	// 		console.log(b)
	// 		blob = b;
	// 	},
	// 	fType,
	// 	qlty
	// );

	fetch('/compress/', {
		body: `&uri=${uri}&qlty=${qlty}`,
		headers: new Headers({
			'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
		}),
		method: 'POST',
	})
		.then(res => res.text())
		.then(res => {
			console.log(res);
		});
};