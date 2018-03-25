import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { Input, Icon, Row, Col } from 'antd'
import moment from 'moment'

moment.locale('en', {
    week : {
        dow : 0
    }
});

let globalKey = 0

export default class WeekPicker extends Component {
    constructor(props) {
        super(props)
        const now = moment()
        const year = now.year()
        const month = now.month()
        const items = this._generateItems(year, month)
        const startIndexes = this._getStartEndIndex(items, moment([year, month, 1]))
        const endIndexes = this._getStartEndIndex(items, moment([year, month, now.daysInMonth()]))
        this.state = {
            showContainer: false,
            now: now,
            year: year,
            month: month,
            dd: now.format('DD'),
            items: items,
            startIndex: -1,
            endIndex: -1,
            hoverStartIndex: -1,
            hoverEndIndex: -1,
            enabledStartIndex: startIndexes.startIndex,
            endabedEndIndex: endIndexes.endIndex,
            selectedItems: {
            },
            startDate: null,
            endDate: null,
            pressStatus: 0,
            showClear: false
        }
        this.format = this.props.format || 'YYYY-MM-DD'
    }

    _getStartEndIndex(items, date) {
        const year = date.year()
        const month = date.month()
        const dd = date.format('DD')

        let index = 0
        let weekday = 0
        for (let i = 0; i < items.length; i++) {
            let item = items[i]
            if (item.year == year && item.month == month && item.dd == dd) {
                index = i
                weekday = item.weekday
            }
        }

        weekday -= 1
        if (weekday < 0) {
            weekday = 6
        }

        return {
            startIndex: index - weekday,
            endIndex: index + (6 - weekday)
        }
    }

    _generateItems(year, month) {
        const firstdayInMonth = moment([year, month, 1])
        const weekdayOfFirstDayInMonth = firstdayInMonth.weekday()
        let firstItemMoment = 0
        if (weekdayOfFirstDayInMonth == 0) {
            firstItemMoment = firstdayInMonth.subtract(8, 'days')
        } else {
            firstItemMoment = firstdayInMonth.subtract(weekdayOfFirstDayInMonth + 1, 'days')
        }
        const items = []
        for (let i = 0; i < 49; i++) {
            const date = moment(firstItemMoment.add(1, 'days'))
            items.push({
                date: date,
                index: i,
                title: date.format(this.format),
                dd: date.format('DD'),
                year: date.year(),
                month: date.month(),
                weekday: date.weekday()
            })
        }
        return items
    }

    onSlected(event, item) {
        this.state.pressStatus = 1
        const indexes = this._getStartEndIndex(this.state.items, item.date)
        const selectedItems = {

        }
        for (let i = indexes.startIndex; i <= indexes.endIndex; i++) {
            const it = this.state.items[i]
            selectedItems[it.date.format(this.format)] = true
        }

        let isUnSelected = true
        if (Object.keys(this.state.selectedItems).length > 0) {
            Object.keys(this.state.selectedItems).forEach(key => {
                if (!selectedItems[key]) {
                    isUnSelected = false
                }
            })
        } else {
            isUnSelected = false
        }

        if (!isUnSelected) {
            if (this.props.onChange) {
                this.props.onChange(this.state.items[indexes.startIndex].date, this.state.items[indexes.endIndex].date)
            }

            this.setState({
                showContainer: false,
                startIndex: indexes.startIndex,
                endIndex: indexes.endIndex,
                selectedItems: selectedItems,
                startDate: this.state.items[indexes.startIndex].date,
                endDate: this.state.items[indexes.endIndex].date
            })
        } else {
            if (this.props.onChange) {
                this.props.onChange(null, null)
            }
            this.setState({
                showContainer: false,
                startIndex: -1,
                endIndex: -1,
                selectedItems: {},
                startDate: null,
                endDate: null
            })
        }
    }

    onMouseEnter(item) {
        const indexes = this._getStartEndIndex(this.state.items, item.date)
        this.setState({
            hoverStartIndex: indexes.startIndex,
            hoverEndIndex: indexes.endIndex
        })
    }

    onMouseLeave() {
        this.setState({
            hoverStartIndex: -1,
            hoverEndIndex: -1
        })
    }

    onAddMonth() {
        let month = this.state.month + 1
        let year = this.state.year
        if (month > 11) {
            month = 0
            year = year + 1
        }
        const items = this._generateItems(year, month)
        const firstDay = moment([year, month, 1])
        const startIndexes = this._getStartEndIndex(items, firstDay)
        const endIndexes = this._getStartEndIndex(items, moment([year, month, firstDay.daysInMonth()]))
        this.setState({ year: year, month: month, items: items, enabledStartIndex: startIndexes.startIndex, endabedEndIndex: endIndexes.endIndex })
    }

    onSubMonth() {
        let month = this.state.month - 1
        let year = this.state.year
        if (month < 0) {
            month = 11
            year = year - 1
        }
        const items = this._generateItems(year, month)
        const firstDay = moment([year, month, 1])
        const startIndexes = this._getStartEndIndex(items, firstDay)
        const endIndexes = this._getStartEndIndex(items, moment([year, month, firstDay.daysInMonth()]))
        this.setState({ year: year, month: month, items: items, enabledStartIndex: startIndexes.startIndex, endabedEndIndex: endIndexes.endIndex })
    }

    onAddYear() {
        this.onYear(1)
    }

    onSubYear() {
        this.onYear(-1)
    }

    onYear(delta) {
        const year = this.state.year + delta
        const items = this._generateItems(year, this.state.month)
        const firstDay = moment([year, this.state.month, 1])
        const startIndexes = this._getStartEndIndex(items, firstDay)
        const endIndexes = this._getStartEndIndex(items, moment([year, this.state.month, firstDay.daysInMonth()]))
        this.setState({ year: year, items: items, enabledStartIndex: startIndexes.startIndex, endabedEndIndex: endIndexes.endIndex })
    }

    delayDisappear(event) {
        setTimeout(() => {
            if (this.state.pressStatus != 2) {
                this.setState({ showContainer: false })
            } else {
                this.refs.dj_week_picker.focus()
                this.setState({ showContainer: true })
            }
            this.state.pressStatus = 0
        }, 150)
    }

    onPress() {
        if (this.state.pressStatus == 0) {
            this.state.pressStatus = 2
        }
    }

    onInputMouserEnter() {
        if (this.state.startDate) {
            this.setState({ showClear: true })
        }
    }

    onInputMouserOut() {
        this.setState({ showClear: false })
    }

    onClear() {
        if (this.props.onChange) {
            this.props.onChange(null, null)
        }
        this.setState({
            showContainer: false,
            startIndex: -1,
            endIndex: -1,
            selectedItems: {},
            startDate: null,
            endDate: null
        })
    }

    render() {
        const days = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'].map(item => {
            return <div key={item} className='dj-week-picker-item'>{item}</div>
        })

        const items = this.state.items.map(item => {
            let classnames = ['dj-week-picker-item']
            if (item.index >= this.state.startIndex && item.index <= this.state.endIndex) {
                if (this.state.selectedItems[item.date.format(this.format)])
                    classnames.push('dj-week-picker-item--selected')
            }

            if (item.index >= this.state.hoverStartIndex && item.index <= this.state.hoverEndIndex) {
                classnames.push('dj-week-picker-item--hover')
            }

            if (item.year == this.state.now.year() && item.month == this.state.now.month() && item.dd == this.state.now.format('DD')) {
                classnames.push('dj-week-picker-item--now')
            }

            if (item.index < this.state.enabledStartIndex || item.index > this.state.endabedEndIndex) {
                return <div key={globalKey++}
                    title={item.title}
                    className='dj-week-picker-item dj-week-picker-item--disabled'>{item.dd}</div>
            }
            return <div key={globalKey++}
                title={item.title}
                className={classnames.join(' ')}
                onClick={(event) => { this.onSlected(event, item) }}
                onMouseEnter={() => { this.onMouseEnter(item) }}
                onMouseOut={() => { this.onMouseLeave() }}>{item.dd}</div>
        })

        let displayValue = ''
        if (this.state.startDate) {
            displayValue = this.state.startDate.format(this.format) + ' - ' + this.state.endDate.format(this.format)
        }

        const containerStyle = ['dj-week-picker-container']
        if (this.state.showContainer) {
            containerStyle.push('dj-week-picker-container--show')
        } else {
            containerStyle.push('dj-week-picker-container--hidden')
        }
        return (
            <div className='dj-week-picker' onMouseOut={() => { this.onMouseLeave() }} style={{ width: this.props.width || 200 }}>
                <Row style={{ border: '1px solid #e3e3e3', borderRadius: '3px' }}
                    onMouseMove={() => { this.onInputMouserEnter() }}
                    onMouseOut={() => { this.onInputMouserOut() }}>
                    <Col span={20}>
                        <Input ref='dj_week_picker'
                            style={{ border: '0px solid white' }}
                            value={displayValue}
                            placeholder={this.props.placeHolder ? this.props.placeHolder : '请选择自然周'}
                            onFocus={() => { this.setState({ showContainer: true }) }}
                            onBlur={(event) => { this.delayDisappear(event) }}></Input>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                        {(() => {
                            if (this.state.showClear) {
                                return <Icon type="close-circle"
                                    style={{ fontSize: '12px', marginRight: '12px', marginTop: '8px', cursor: 'pointer', color: '#a3a3a3' }}
                                    onClick={() => { this.onClear() }} />
                            }
                            return <Icon type="calendar" style={{ fontSize: '12px', marginRight: '12px', marginTop: '8px' }} />
                        })()}
                    </Col>
                </Row>

                <label className={containerStyle.join(' ')} onClick={() => { this.onPress() }}>
                    <div>
                        <Input className='dj-week-picker-container-input'
                            placeholder={this.props.placeHolder ? this.props.placeHolder : '请选择自然周'}
                            readOnly
                            value={displayValue}></Input>
                    </div>
                    <div className='dj-week-picker-operations'>
                        <Row>
                            <Col span={6} style={{ textAlign: 'left' }}>
                                <Icon type="double-left" style={{ marginRight: '8px', fontSize: '12px', cursor: 'pointer' }} onClick={() => { this.onSubYear() }} />
                                <Icon type="left" style={{ fontSize: '12px', cursor: 'pointer' }} onClick={() => { this.onSubMonth() }} />
                            </Col>
                            <Col span={12} style={{ color: 'black', textAlign: 'center', fontSize: '13px', marginTop: '-4px', fontWeight: 'bold' }}>
                                {this.state.year}年{this.state.month + 1}月
                            </Col>
                            <Col span={6} style={{ textAlign: 'right' }}>
                                <Icon type="right" style={{ marginRight: '8px', fontSize: '12px', cursor: 'pointer' }} onClick={() => { this.onAddMonth() }} />
                                <Icon type="double-right" style={{ fontSize: '12px', cursor: 'pointer' }} onClick={() => { this.onAddYear() }} />
                            </Col>
                        </Row>
                    </div>

                    <div className='dj-week-picker-items'>
                        {days}
                        {items}
                    </div>
                </label>
            </div>
        )
    }
}

WeekPicker.propTypes = {
    placeHolder: PropTypes.string,
    onChange: PropTypes.func,
    width: PropTypes.number,
    format: PropTypes.string
}