grecaptcha.ready(function() {
    grecaptcha.execute('6Ldfaz0qAAAAALqlESrI6r6BEySsaG-xp6jd1pQ0', {action: 'submit'}).then(function(token) {
        document.getElementById('g-recaptcha-response').value = token;
    });
});

