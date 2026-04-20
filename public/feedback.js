(function () {
  var currentRating = 0;

  var html =
    '<button class="fb-trigger" id="fb-trigger" title="Send Feedback">&#x1F4AC;</button>' +
    '<div class="fb-overlay hidden" id="fb-overlay">' +
      '<div class="fb-box">' +
        '<button class="fb-close" id="fb-close">&times;</button>' +
        '<div id="fb-form">' +
          '<h2>How are you liking it?</h2>' +
          '<p>Rate your experience and share ideas!</p>' +
          '<div class="fb-stars" id="fb-stars">' +
            '<button class="fb-star" data-v="1">&#9733;</button>' +
            '<button class="fb-star" data-v="2">&#9733;</button>' +
            '<button class="fb-star" data-v="3">&#9733;</button>' +
            '<button class="fb-star" data-v="4">&#9733;</button>' +
            '<button class="fb-star" data-v="5">&#9733;</button>' +
          '</div>' +
          '<textarea class="fb-textarea" id="fb-message" placeholder="Feature request, bug report, or just say hi..." maxlength="1000"></textarea>' +
          '<button class="fb-submit" id="fb-submit">Send Feedback</button>' +
          '<p class="fb-email-note">Or email us at <a href="mailto:contactgameslibrary@proton.me">contactgameslibrary@proton.me</a></p>' +
        '</div>' +
        '<div id="fb-thanks" class="fb-thanks" style="display:none">' +
          '<span>&#x1F49C;</span>' +
          '<strong>Thank you!</strong>' +
          '<em>Your feedback helps make these games better.</em>' +
        '</div>' +
      '</div>' +
    '</div>';

  var container = document.createElement('div');
  container.innerHTML = html;
  while (container.firstChild) {
    document.body.appendChild(container.firstChild);
  }

  var trigger = document.getElementById('fb-trigger');
  var overlay = document.getElementById('fb-overlay');
  var closeBtn = document.getElementById('fb-close');
  var stars = document.querySelectorAll('.fb-star');
  var message = document.getElementById('fb-message');
  var submitBtn = document.getElementById('fb-submit');
  var formEl = document.getElementById('fb-form');
  var thanksEl = document.getElementById('fb-thanks');

  function open() {
    overlay.classList.remove('hidden');
  }

  function close() {
    overlay.classList.add('hidden');
    setTimeout(function () {
      formEl.style.display = '';
      thanksEl.style.display = 'none';
      currentRating = 0;
      message.value = '';
      stars.forEach(function (s) { s.classList.remove('active'); });
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback';
    }, 300);
  }

  function setRating(v) {
    currentRating = v;
    stars.forEach(function (s) {
      s.classList.toggle('active', Number(s.dataset.v) <= v);
    });
  }

  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) close();
  });

  stars.forEach(function (s) {
    s.addEventListener('click', function () {
      setRating(Number(s.dataset.v));
    });
  });

  submitBtn.addEventListener('click', function () {
    if (currentRating === 0) {
      setRating(0);
      stars[0].style.outline = '2px solid #FA003F';
      setTimeout(function () { stars[0].style.outline = ''; }, 800);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    var page = window.location.pathname || '/';

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: currentRating,
        message: message.value.trim(),
        page: page,
      }),
    })
      .then(function () {
        formEl.style.display = 'none';
        thanksEl.style.display = '';
        setTimeout(close, 2000);
      })
      .catch(function () {
        formEl.style.display = 'none';
        thanksEl.style.display = '';
        setTimeout(close, 2000);
      });
  });
})();
