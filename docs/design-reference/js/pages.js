/*
 * pages.js
 * Progressive-enhancement behaviour for the interior pages only:
 *  - Contact form validation + a calculation ("math") captcha (contact.html)
 *  - Comment section list + form (terms.html only)
 *
 * Both features no-op safely on any page that doesn't have the matching
 * markup, so this single file can be included on every page.
 *
 * This project ships as static HTML with no backend, so form submissions
 * are validated and handled entirely client-side. All persistence uses
 * localStorage scoped per page, which is a client-side demo only.
 * Before production launch, replace the two "TODO: backend" markers below
 * with real API calls, and re-validate/sanitize everything server-side —
 * client-side checks never provide real security on their own.
 */
(function ($) {
    "use strict";

    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Starter comments shown before a visitor's browser has any of its own
    // saved locally, keyed by the page's data-page attribute. The comments
    // section currently only ships on the Terms & Conditions page.
    var SEED_COMMENTS = {
        terms: [
            { name: "Ibrahim Farouk", message: "Appreciate how clearly the liability section is written compared to most vendor terms.", date: "Jul 5, 2026" }
        ]
    };

    function setError($field, message) {
        var $err = $field.closest(".formgroup").find(".field-error");
        $err.text(message || "");
        $field.attr("aria-invalid", message ? "true" : "false");
    }

    /* ---------------------------------------------------------------- */
    /* Contact form                                                      */
    /* ---------------------------------------------------------------- */
    function initContactForm() {
        var $form = $("#contactForm");
        if (!$form.length) { return; }

        var $captchaQuestion = $form.find("#captchaQuestion");
        var $captchaInput = $form.find("#c-captcha");
        var captchaAnswer = 0;

        function newCaptcha() {
            var a = Math.floor(Math.random() * 10) + 1;
            var b = Math.floor(Math.random() * 10) + 1;
            captchaAnswer = a + b;
            $captchaQuestion.text(a + " + " + b);
            $captchaInput.val("");
        }
        newCaptcha();

        $form.on("submit", function (e) {
            e.preventDefault();

            var $alert = $form.find("#contactAlert");
            var isValid = true;

            var $name = $form.find("#c-name");
            var $email = $form.find("#c-email");
            var $phone = $form.find("#c-phone");
            var $subject = $form.find("#c-subject");
            var $message = $form.find("#c-message");
            var $honeypot = $form.find("#c-website");

            setError($name, ""); setError($email, ""); setError($phone, "");
            setError($subject, ""); setError($message, ""); setError($captchaInput, "");

            // Honeypot: real users never fill this hidden field. If it has a
            // value, silently pretend success so bots don't learn they were caught.
            if ($.trim($honeypot.val()) !== "") {
                $form.trigger("reset");
                newCaptcha();
                $alert.attr("class", "form-alert success").text(
                    "Thank you. Your message has been submitted."
                ).prop("hidden", false);
                return;
            }

            if ($.trim($name.val()).length < 2) {
                setError($name, "Please enter your full name.");
                isValid = false;
            }
            if (!EMAIL_RE.test($.trim($email.val()))) {
                setError($email, "Please enter a valid email address.");
                isValid = false;
            }
            var phoneVal = $.trim($phone.val());
            if (phoneVal !== "" && !/^[0-9+\-()\s]{7,20}$/.test(phoneVal)) {
                setError($phone, "Please enter a valid phone number.");
                isValid = false;
            }
            if ($.trim($subject.val()).length < 3) {
                setError($subject, "Please enter a subject.");
                isValid = false;
            }
            if ($.trim($message.val()).length < 10) {
                setError($message, "Please enter at least 10 characters.");
                isValid = false;
            }
            if (parseInt($captchaInput.val(), 10) !== captchaAnswer) {
                setError($captchaInput, "Incorrect answer, please try again.");
                isValid = false;
            }

            if (!isValid) {
                $alert.attr("class", "form-alert error").text(
                    "Please correct the highlighted fields and try again."
                ).prop("hidden", false);
                newCaptcha();
                return;
            }

            // TODO: backend — replace with a real submission (fetch/AJAX) to a
            // server endpoint that re-validates and sanitizes all fields again.
            $alert.attr("class", "form-alert success").text(
                "Thank you, " + $.trim($name.val()) + ". Your message has been submitted and our team will respond shortly."
            ).prop("hidden", false);
            $form.trigger("reset");
            newCaptcha();
        });
    }

    /* ---------------------------------------------------------------- */
    /* Comments                                                          */
    /* ---------------------------------------------------------------- */
    function storageKey() {
        return "trendshift-comments-" + (document.body.getAttribute("data-page") || "page");
    }

    function loadComments(seed) {
        try {
            var raw = window.localStorage.getItem(storageKey());
            if (raw) { return JSON.parse(raw); }
        } catch (err) { /* localStorage unavailable (private mode, etc.) */ }
        return seed;
    }

    function saveComments(list) {
        try {
            window.localStorage.setItem(storageKey(), JSON.stringify(list));
        } catch (err) { /* ignore persistence errors */ }
    }

    function initials(name) {
        var parts = $.trim(name).split(/\s+/);
        var text = (parts[0] ? parts[0].charAt(0) : "") + (parts[1] ? parts[1].charAt(0) : "");
        return text.toUpperCase() || "?";
    }

    function renderComments($list, comments) {
        $list.empty();
        if (!comments.length) {
            $list.append('<p class="commentempty">Be the first to share your thoughts.</p>');
            return;
        }
        comments.forEach(function (c) {
            var $item = $('<div class="commentitem"></div>');
            var $avatar = $('<div class="commentavatar" aria-hidden="true"></div>').text(initials(c.name));
            var $body = $('<div class="commentbody"></div>');
            var $h3 = $("<h3></h3>").text(c.name);
            $h3.append($("<span></span>").text(c.date));
            var $p = $("<p></p>").text(c.message);
            $body.append($h3, $p);
            $item.append($avatar, $body);
            $list.append($item);
        });
    }

    function initComments() {
        var $section = $(".commentswrap");
        if (!$section.length) { return; }

        var $list = $section.find("#commentList");
        var $form = $section.find("#commentForm");
        var page = document.body.getAttribute("data-page") || "";
        var seed = SEED_COMMENTS[page] || [];

        var comments = loadComments(seed);
        renderComments($list, comments);

        $form.on("submit", function (e) {
            e.preventDefault();

            var $alert = $section.find("#commentAlert");
            var $name = $form.find("#c-comment-name");
            var $email = $form.find("#c-comment-email");
            var $message = $form.find("#c-comment-message");
            var $honeypot = $form.find("#c-comment-website");

            setError($name, ""); setError($email, ""); setError($message, "");

            if ($.trim($honeypot.val()) !== "") {
                $form.trigger("reset");
                return;
            }

            var isValid = true;
            if ($.trim($name.val()).length < 2) {
                setError($name, "Please enter your name.");
                isValid = false;
            }
            if (!EMAIL_RE.test($.trim($email.val()))) {
                setError($email, "Please enter a valid email address.");
                isValid = false;
            }
            if ($.trim($message.val()).length < 5) {
                setError($message, "Comment is too short.");
                isValid = false;
            }
            if (!isValid) {
                $alert.attr("class", "form-alert error").text("Please correct the highlighted fields.").prop("hidden", false);
                return;
            }

            var newComment = {
                name: $.trim($name.val()),
                message: $.trim($message.val()),
                date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
            };

            // Client-side only demo, scoped to this browser via localStorage.
            // TODO: backend — persist comments server-side with moderation
            // before this ships as a real public commenting feature.
            comments = comments.concat([newComment]);
            saveComments(comments);
            renderComments($list, comments);

            $alert.attr("class", "form-alert success").text("Thank you, your comment has been posted.").prop("hidden", false);
            $form.trigger("reset");
        });
    }

    $(function () {
        initContactForm();
        initComments();
    });

})(jQuery);
