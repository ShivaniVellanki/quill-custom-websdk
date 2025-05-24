/*─────────────────────────────────────────────────────────────────────────────
  kore-main.js  –  bootstrap the Kore.ai Web-SDK chat without auto-show
─────────────────────────────────────────────────────────────────────────────*/
(function ($) {

    $(document).ready(function () {

        /*────────────────────  1 • JWT HELPER  ────────────────────*/
        function assertion(options, callback) {
            $.ajax({
                url      : options.JWTUrl,
                type     : 'post',
                dataType : 'json',
                data     : {
                    clientId     : options.clientId,
                    clientSecret : options.clientSecret,
                    identity     : options.userIdentity,
                    aud          : '',
                    isAnonymous  : false
                },
                success  : function (res) {
                    options.assertion   = res.jwt;
                    options.handleError = koreBot.showError;
                    options.chatHistory = koreBot.chatHistory;
                    options.botDetails  = koreBot.botDetails;
                    callback(null, options);
                    setTimeout(() => koreBot.initToken?.(options), 2000);
                },
                error    : err => koreBot.showError(err.responseText)
            });
        }

        /*────────────────────  2 • BRANDING (optional) ────────────────────*/
        function applyBranding(opts) {
            const bo = chatConfig.botOptions;
            if (!bo.enableThemes) return;
            const url = (bo.brandingAPIUrl || '').replace(':appId', bo.botInfo._id);
            $.ajax({
                url,
                type    : 'get',
                headers : { Authorization: 'bearer ' + opts.authorization.accessToken },
                dataType: 'json',
                success : data => {
                    koreBot.applySDKBranding?.(data);
                    koreBot.initToken?.(opts.authorization);
                }
            });
        }
        function onJWTGrantSuccess(opts) { applyBranding(opts); }

        /*────────────────────  3 • CONFIGURE SDK ────────────────────*/
        const chatConfig = window.KoreSDK.chatConfig;
        chatConfig.botOptions.assertionFn       = assertion;
        chatConfig.botOptions.jwtgrantSuccessCB = onJWTGrantSuccess;

        /*────────────────────  4 • INSTANTIATE BOT ────────────────────*/
        const koreBot = koreBotChat();      // returns the controller

        /*────────────────────  5 • EXPOSE FOR OTHER SCRIPTS ────────────────────*/
        // window.koreBot     = koreBot;
        // window.koreChatCfg = chatConfig;
         //koreBot.show(chatConfig);
        /*────────────────────  6 • BIND LAUNCHER — NO AUTO-SHOW ────────────────────*/
        $('.openChatWindow').on('click', () => {
            koreBot.show(chatConfig);
            // chatConfig.botOptions.botInfo.customData = { language: "french" };
        });

        // NOTE: we no longer call koreBot.show(chatConfig) here on load
    });

})(jQuery || (window.KoreSDK &&
             window.KoreSDK.dependencies &&
             window.KoreSDK.dependencies.jQuery));