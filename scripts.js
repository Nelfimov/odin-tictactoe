const fields = document.querySelectorAll('div.field');
const X = 'static/x.svg';
const O = 'static/o.svg';

fields.forEach(field => field.addEventListener('click', () => {
  if (field.childElementCount === 0) {
    const img = document.createElement('img');
    img.src = X;
    field.appendChild(img);
  }
}))