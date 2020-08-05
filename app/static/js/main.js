const $ = (el) => {
	const nodes = Array.from(document.querySelectorAll.call(document, el));

	if (nodes.length === 0) {
		return null;
	}
	if (nodes.length === 1) {
		return nodes[0];
	}
	return nodes;
};
const $dloadBtn = $('.canvas__dloadBtn');
const $picInfo = $('.canvas__picInfo');
const $canvas = document.getElementById('canvas');
const $ctrlQuality = $('.canvas__qualityChange');
// const $ctrlFType = $('.canvas__fType');
const $canvasQlty = $('.canvas__quality');
const $canvasQltyVal = $('.canvas__qualityVal');

let dloadFType = 'png';
let dloadQlty = 0.92;

const drawBlur = (bg, img) => {
	// Store the width and height of the canvas for below
	const w = $canvas.width;
	const h = $canvas.height;
	const arCanv = w / h;
	const arImg = img.w / img.h;
	const scaleFactor = 1.2;
	const canvasContext = $canvas.getContext('2d');

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

const drawNormal = (bg, img) => {
	// Store the width and height of the canvas for below
	const w = $canvas.width;
	const h = $canvas.height;
	const arCanv = w / h;
	const arImg = img.w / img.h;
	const canvasContext = $canvas.getContext('2d');

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
	$('.canvas__result').classList.remove('d-none');
};

const swagImgUrl =
	'https://s3-ap-southeast-1.amazonaws.com/push-images/bns.svg';
// 'https://cricketswag.com/swagEmbedder/static/img/cswag__watermark--combined.png';
const options = {
	method: 'GET',
	mode: 'cors',
	cache: 'no-store',
};
const swagImgRequest = new Request(swagImgUrl);

function arrayBufferToBase64(buffer) {
	let binary = '';
	const bytes = [].slice.call(new Uint8Array(buffer));

	bytes.forEach((b) => (binary += String.fromCharCode(b)));

	return window.btoa(binary);
}

const drawSwag = (ver, hor) => {
	// Store the width and height of the canvas for below
	const canvasContext = $canvas.getContext('2d');
	const w = $canvas.width;
	const h = $canvas.height;
	const canvasForeGround = new Image();

	fetch(swagImgRequest, options).then((response) => {
		response.arrayBuffer().then((buffer) => {
			const base64Flag = 'data:image/svg+xml;base64,';
			const imageStr = arrayBufferToBase64(buffer);

			canvasForeGround.src = base64Flag + imageStr;

			canvasForeGround.onload = function () {
				const posY = ver === 0 ? 10 : h - 116;
				const posX = hor === 0 ? 10 : w - 116;

				canvasContext.drawImage(canvasForeGround, posX, posY, 105, 105);
				// compress($canvas, dloadFType, dloadQlty);
			};
		});
	});
};

/**
 * embed to canvas
 */

const embedToCanvas = (src, w, h, imgPos) => {
	let canvasW = w;
	let canvasH = h;
	// const canvasContext = $canvas.getContext('2d');
	const canvasBackground = new Image();
	canvasBackground.src = src;
	canvasBackground.onload = function () {
		const img = {
			w: this.width,
			h: this.height,
		};

		canvasW = w ? w : this.width;
		canvasH = h ? h : this.height;
		$('#upload__dimensions--w').value = canvasW;
		$('#upload__dimensions--h').value = canvasH;
		$canvas.width = canvasW;
		$canvas.height = canvasH;

		drawBlur(canvasBackground, img);
		drawNormal(canvasBackground, img);

		let ver, hor;
		if (imgPos !== 'ns') {
			drawSwag(
				imgPos && imgPos[0] === 't' ? 0 : 1,
				imgPos && imgPos[1] === 'l' ? 0 : 1
			);
		}
		// updateSize();
		// compress($canvas, dloadFType, dloadQlty);
	};
};

const handleFileSelect = (files, w, h, imgPos) => {
	const f = files[0];
	const reader = new FileReader();

	if (f) {
		reader.onload = ((theFile) => (e) => {
			embedToCanvas(e.target.result, w, h, imgPos);
		})(f);

		reader.readAsDataURL(f);
	}
};

const downloadCanvas = (e, fType = dloadFType, qlty = dloadQlty) => {
	const link = e.target;
	const { width, height } = $canvas;
	const href = $canvas.toDataURL(`image/${fType}`, Number(qlty));
	// $picInfo.innerHTML = `${(href.length * 3) / (4 * 1024)}KB`;

	link.href = href;
	link.download = `banner__${width}-${height}.${fType}`;
};

// const updateSize = (fType = 'png', qlty = 0.92) => {
// 	const href = $canvas.toDataURL(`image/${fType}`, Number(qlty));
// 	const size = `${(href.length * 3) / (4 * 1024)}KB`;
// 	$picInfo.innerHTML = size;
// };

const updatefType = (fType) => {
	// updateSize(fType, dloadQlty);
	dloadFType = fType;
};

const updateQlty = (qlty) => {
	// updateSize(dloadFType, qlty);
	dloadQlty = qlty;
};

$dloadBtn.addEventListener('click', (e) => {
	downloadCanvas(e);
});

// $ctrlQuality.addEventListener('input', (e) => {
// 	const { value } = e.target;
// 	$canvasQltyVal.innerHTML = value;
// 	updateQlty(value);
// });

// $ctrlFType.forEach((el) => {
// 	el.addEventListener('change', (e) => {
// 		const { value } = e.target;
// 		if (value === 'png') {
// 			$canvasQlty.classList.add('d-none');
// 		} else {
// 			$canvasQlty.classList.remove('d-none');
// 		}
// 		updatefType(value);
// 	});
// });

$('#upload__dimensions--w').addEventListener('input', (e) => {
	// $('#upload__dimensions--w').value = '';
	// $('#upload__dimensions--h').value = '';	form = document.getElementById('upload_form');
	// console.log(e.target.value);
	const $fileElem = $('#upload__img');

	if ($fileElem.files.length > 0) {
		const formData = new FormData(form);
		const height = formData.get('height');
		const imgPos = formData.get('imgPosRadio');

		handleFileSelect(
			$fileElem.files,
			e.target.value,
			height,
			imgPos.split('-')[1]
		);
	}
});

$('#upload__dimensions--h').addEventListener('input', (e) => {
	// $('#upload__dimensions--w').value = '';
	// $('#upload__dimensions--h').value = '';	form = document.getElementById('upload_form');
	const $fileElem = $('#upload__img');

	if ($fileElem.files.length > 0) {
		const formData = new FormData(form);
		const width = formData.get('width');
		const imgPos = formData.get('imgPosRadio');

		handleFileSelect(
			$fileElem.files,
			width,
			e.target.value,
			imgPos.split('-')[1]
		);
	}
});

$('#upload__img').addEventListener('change', (e) => {
	// $('#upload__dimensions--w').value = '';
	// $('#upload__dimensions--h').value = '';	form = document.getElementById('upload_form');
	const formData = new FormData(form);
	const imgPos = formData.get('imgPosRadio');

	handleFileSelect(
		e.target.files,
		undefined,
		undefined,
		imgPos.split('-')[1]
	);
});

$('.form-check-input').forEach((el) => {
	el.addEventListener('change', (e) => {
		const $fileElem = $('#upload__img');

		if ($fileElem.files.length > 0) {
			handleFileSelect(
				$fileElem.files,
				undefined,
				undefined,
				e.target.value.split('-')[1]
			);
		}
	});
});

let form;
if (window.FileReader) {
	form = document.getElementById('upload_form');

	form.onsubmit = (e) => {
		e.preventDefault();
		const formData = new FormData(form);
		const width = formData.get('width');
		const height = formData.get('height');
		const imgPos = formData.get('imgPosRadio');

		handleFileSelect(
			e.target[0].files,
			width,
			height,
			imgPos.split('-')[1]
		);
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
		.then((res) => res.text())
		.then((res) => {
			console.log(res);
		});
};
