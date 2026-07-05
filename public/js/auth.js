/* ═══════════════════════════════════════════════════
   STAY-EASE — Auth Client-Side JavaScript
   Form validation, username check, progress bar, avatar upload
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ===== Username Availability Check =====
  const usernameInput = document.getElementById('username-input');
  const usernameStatus = document.getElementById('username-status');
  let usernameTimer = null;

  if (usernameInput && usernameStatus) {
    usernameInput.addEventListener('input', function () {
      clearTimeout(usernameTimer);
      const val = this.value.toLowerCase().trim();

      usernameStatus.className = 'username-status';
      usernameStatus.innerHTML = '';

      if (!val || val.length < 3) {
        usernameStatus.style.display = 'none';
        return;
      }

      // Show checking spinner
      usernameStatus.className = 'username-status checking';
      usernameStatus.innerHTML = '<div class="spinner spinner-sm"></div>';
      usernameStatus.style.display = 'flex';

      usernameTimer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(val)}`);
          const data = await res.json();

          if (data.available) {
            usernameStatus.className = 'username-status available';
            usernameStatus.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Available`;
          } else {
            usernameStatus.className = 'username-status taken';
            usernameStatus.innerHTML = `
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Taken`;
          }
        } catch {
          usernameStatus.style.display = 'none';
        }
      }, 500);
    });
  }

  // ===== Avatar Upload Preview =====
  const avatarUpload = document.getElementById('avatar-upload-zone');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const avatarPreviewImg = document.getElementById('avatar-preview-img');
  const avatarPlaceholder = document.getElementById('avatar-placeholder');
  const avatarDataInput = document.getElementById('avatar-data');

  if (avatarUpload && avatarFileInput) {
    avatarUpload.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        showFieldError('avatar-group', 'Image must be under 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showFieldError('avatar-group', 'Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        if (avatarPreviewImg) {
          avatarPreviewImg.src = e.target.result;
          avatarPreviewImg.style.display = 'block';
        }
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
        if (avatarDataInput) avatarDataInput.value = e.target.result;
        updateProgress();
      };
      reader.readAsDataURL(file);
    });
  }

  // ===== Signup Progress Bar =====
  const progressFill = document.getElementById('progress-fill');
  const progressPct = document.getElementById('progress-pct');
  const signupForm = document.getElementById('signup-form');

  function updateProgress() {
    if (!signupForm || !progressFill) return;

    const requiredFields = signupForm.querySelectorAll('[required]');
    let filled = 0;
    let total = requiredFields.length;

    requiredFields.forEach(field => {
      if (field.type === 'radio') {
        const name = field.name;
        const checked = signupForm.querySelector(`input[name="${name}"]:checked`);
        if (checked) filled++;
        // Count radio groups once
        total = total - signupForm.querySelectorAll(`input[name="${name}"]`).length + 1;
      } else if (field.value.trim()) {
        filled++;
      }
    });

    // Recalculate total for radio groups
    const radioNames = new Set();
    signupForm.querySelectorAll('input[type="radio"][required]').forEach(r => radioNames.add(r.name));
    const nonRadioRequired = signupForm.querySelectorAll('[required]:not(input[type="radio"])');
    total = nonRadioRequired.length + radioNames.size;

    filled = 0;
    nonRadioRequired.forEach(field => {
      if (field.value.trim()) filled++;
    });
    radioNames.forEach(name => {
      if (signupForm.querySelector(`input[name="${name}"]:checked`)) filled++;
    });

    const pct = Math.round((filled / total) * 100);
    progressFill.style.width = pct + '%';
    if (progressPct) progressPct.textContent = pct + '%';

    // Enable/disable submit button
    const submitBtn = signupForm.querySelector('.btn-auth');
    if (submitBtn) {
      submitBtn.disabled = pct < 100;
    }
  }

  if (signupForm) {
    signupForm.addEventListener('input', updateProgress);
    signupForm.addEventListener('change', updateProgress);
    // Initial update
    setTimeout(updateProgress, 100);
  }

  // ===== Field Error Helper =====
  function showFieldError(groupId, message) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.classList.add('has-error');
    const errorEl = group.querySelector('.field-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // ===== Form Validation on Submit =====
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      let hasError = false;

      // Clear previous errors
      this.querySelectorAll('.form-group').forEach(g => {
        g.classList.remove('has-error');
      });

      const inputs = this.querySelectorAll('.form-input[required]');
      inputs.forEach(input => {
        if (!input.value.trim()) {
          const group = input.closest('.form-group');
          if (group) group.classList.add('has-error');
          hasError = true;
        }
      });

      // Email validation
      const emailInput = this.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          const group = emailInput.closest('.form-group');
          if (group) group.classList.add('has-error');
          hasError = true;
        }
      }

      if (hasError) {
        e.preventDefault();
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      let hasError = false;

      this.querySelectorAll('.form-group').forEach(g => {
        g.classList.remove('has-error');
      });

      const inputs = this.querySelectorAll('.form-input[required]');
      inputs.forEach(input => {
        if (!input.value.trim()) {
          const group = input.closest('.form-group');
          if (group) group.classList.add('has-error');
          hasError = true;
        }
      });

      // Username format check
      if (usernameInput && usernameInput.value.trim()) {
        const usernameRegex = /^[a-z0-9_]+$/;
        if (!usernameRegex.test(usernameInput.value.trim())) {
          const group = usernameInput.closest('.form-group');
          if (group) group.classList.add('has-error');
          hasError = true;
        }
      }

      // Gender check
      const genderSelect = this.querySelector('select[name="gender"]');
      const genderChecked = genderSelect ? genderSelect.value : this.querySelector('input[name="gender"]:checked');
      if (!genderChecked) {
        const genderGroup = document.getElementById('gender-group');
        if (genderGroup) genderGroup.classList.add('has-error');
        hasError = true;
      }

      if (hasError) {
        e.preventDefault();
      }
    });
  }

})();
