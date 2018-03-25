import {HttpUtil} from 'djmodules-utils';

const requestUrl = {
    notifyToSmartPOS(param) {
        return HttpUtil.promisePost('/rs/cashier/cashierNotify/notifyYunPos.do', param);
    },
    openPOS(param) {
        return HttpUtil.promisePost('https://localhost:16888/open', {
            ...param, _options: {
                rewriteUrl: false,
                checkResponse: false
            }
        });
    },
    sendPOS(param) {
        return HttpUtil.promisePost('https://localhost:16888/send', {
            ...param, _options: {
                rewriteUrl: false,
                checkResponse: false
            }
        });
    },
    getPOSResult(param) {
        return HttpUtil.promisePost('https://localhost:16888/recv', {
            ...param, _options: {
                rewriteUrl: false,
                checkResponse: false
            }
        });
    },
    swipeNotify(param) {
        return HttpUtil.promisePost('/rs/paygateway/notify/posNotify.do', param);
    }
}

export default requestUrl;