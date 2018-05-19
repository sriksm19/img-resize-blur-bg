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
};
/**
 * embed to canvas
 */

const embedToCanvas = (src, w, h) => {
	const canvas = document.getElementById('canvas');
	canvas.width = w;
	canvas.height = h;
	const canvasContext = canvas.getContext('2d');
	const canvasBackground = new Image();
	canvasBackground.src = src;
	canvasBackground.onload = function() {
		const img = {
			w: this.width,
			h: this.height,
		};
		drawBlur(canvas, canvasBackground, img);
		drawNormal(canvas, canvasBackground, img);
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
