(function () {
  var TERMS_KEY = 'gamelibrary.terms.v1';
  var PROJECT_ID = 'wdrprbujsc';

  function hasAccepted() {
    try { return localStorage.getItem(TERMS_KEY) === 'accepted'; }
    catch (e) { return false; }
  }

  function markAccepted() {
    try { localStorage.setItem(TERMS_KEY, 'accepted'); }
    catch (e) { /* ignore */ }
  }

  function loadClarity(id) {
    var w = window;
    if (w.clarity) return;
    w.clarity = function () {
      (w.clarity.q = w.clarity.q || []).push(arguments);
    };
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.clarity.ms/tag/' + id;
    var first = document.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(s, first);
  }

  function showModal(readOnly) {
    var modal = document.getElementById('modal-terms');
    var agree = document.getElementById('btn-terms-accept');
    var close = document.getElementById('btn-terms-close');
    if (!modal || !agree || !close) return;
    modal.classList.remove('hidden');
    agree.classList.toggle('hidden', readOnly);
    close.classList.toggle('hidden', !readOnly);
  }

  function hideModal() {
    var modal = document.getElementById('modal-terms');
    if (modal) modal.classList.add('hidden');
  }

  if (hasAccepted()) {
    loadClarity(PROJECT_ID);
  } else {
    showModal(false);
  }

  document.getElementById('btn-terms-accept').addEventListener('click', function () {
    markAccepted();
    hideModal();
    loadClarity(PROJECT_ID);
  });

  document.getElementById('btn-terms-close').addEventListener('click', function () {
    hideModal();
  });

  var termsLink = document.getElementById('footer-terms');
  if (termsLink) {
    termsLink.addEventListener('click', function (e) {
      e.preventDefault();
      showModal(hasAccepted());
    });
  }
})();
