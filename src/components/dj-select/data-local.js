// 本地数据
export class LocalDataProvider {
    constructor(name, data) {
        this.data = data
        this.name = name;
    }

    getData(success, error) {
        const response = {};
        response[this.name] = this.data;
        // console.log(response)
        success(response)
    }
}

// 店铺类型
export const STORAGE_TYPE = [
    {
        text: '老店',
        value: 1
    }, {
        text: '次新店',
        value: 2
    }, {
        text: '新店',
        value: 3
    },
    {
        text: '其他',
        value: 99
    }
]
// 退货类型
export const RETURN_TYPE = [

    {
        text: '智能退货',
        value: 0
    },
    {
        text: '手工退货',
        value: 1
    }
]


// 订单类型
export const ORDER_TYPE = [
    {
        text: '销售',
        value: 'order_pay'
    },
    {
        text: '退款',
        value: 'order_refund'
    }
]
// 支付方式
export const PAY_STATUS = [
    {
        text: '成功',
        value: 2
    },
    {
        text: '确认中',
        value: 3
    },
    // {
    //     text: '退款确认中',
    //     value: 2
    // },
    // {
    //     text: '退款成功',
    //     value: 3
    // }
]