const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = isOpen ? '×' : '☰';
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    menuToggle.textContent = '☰';
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
document.querySelector('#year').textContent = new Date().getFullYear();

const contactForm = document.querySelector('#contactForm');
const toast = document.querySelector('.toast');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const name = document.querySelector('#parentName').value.trim();
  const email = document.querySelector('#parentEmail').value.trim();
  const enquiry = document.querySelector('#enquiry').value;
  const message = document.querySelector('#message').value.trim();

  // Replace this value with the school's real email address before using the form.
  const schoolEmail = 'readnurseryschool@gmail.com';

  if (schoolEmail === 'readnurseryschool@gmail.com') {
    toast.textContent = `Thank you, ${name}! The form works, but the school's real email address must be added before messages can be sent.`;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 5000);
    return;
  }

  const subject = encodeURIComponent(`Website enquiry: ${enquiry}`);
  const body = encodeURIComponent(`Name: ${name}\nReply email: ${email}\nEnquiry: ${enquiry}\n\nMessage:\n${message}`);
  window.location.href = `mailto:${schoolEmail}?subject=${subject}&body=${body}`;
});
