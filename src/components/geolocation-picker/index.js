import React, { Component } from 'react';
import { Button, Popover, Input, Icon } from 'antd';
import PropTypes from 'prop-types';

export default class GeolocationPicker extends Component {
    static propTypes = {
        mapWidth: PropTypes.number,
        mapHeight: PropTypes.number,
        placeholder: PropTypes.string,
        value: PropTypes.object,
        onChange: PropTypes.func,
        clear: PropTypes.bool
    }

    static defaultProps = {
        mapWidth: 560,
        mapHeight: 300,
        placeholder: '请选择地理位置',
        clear: false
    }

    constructor(props) {
        super(props);
        this.map = null;
        this.state = {
            lng: this.props.value ? this.props.value.lng : -1,
            lat: this.props.value ? this.props.value.lat : -1
        };
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (this.props.value != nextProps.value) {
            const value = nextProps.value || { lng: -1, lat: -1 };
            this.setState({
                lng: value.lng,
                lat: value.lat
            });
            if (this.map) {
                this.map.clearOverlays();
                if (value.lng != -1 && value.lat != -1)
                    this.addOverLay(value.lng, value.lat);
            }
        }
    }

    onResolveLocation = (result) => {
        if (result.name == '全国') {
            this.map.centerAndZoom('杭州', 12);
        } else {
            this.map.centerAndZoom(result.name, 12);
        }
    }

    onRef = (dom) => {
        this.map = new BMap.Map("location-picker");
        if (this.state.lng == -1 && this.state.lat == -1) {
            var myCity = new BMap.LocalCity();
            myCity.get(this.onResolveLocation);
        } else {
            this.map.centerAndZoom(new BMap.Point(this.state.lng, this.state.lat), 12);// 初始化地图,设置中心点坐标和地图级别
            this.addOverLay(this.state.lng, this.state.lat);
        }
        this.map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

        if (this.props.onChange) {
            this.map.addEventListener("click", (e) => {
                e.target.value = e.point;
                this.props.onChange(e);
            });
        } else {
            this.map.addEventListener("click", (e) => {
                this.map.clearOverlays();
                this.setState({
                    lng: e.point.lng,
                    lat: e.point.lat
                });
                this.addOverLay(e.point.lng, e.point.lat);
            });
        }
    }

    addOverLay = (lng, lat) => {
        if (this.map) {
            var point = new BMap.Point(lng, lat);
            var marker = new BMap.Marker(point);  // 创建标注
            this.map.addOverlay(marker);               // 将标注添加到地图中
            marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
        }
    }

    render() {
        const width = this.props.width;
        const height = this.props.height;

        const inputProps = {
            style: Object.assign({}, this.props.style || {}),
            placeholder: this.props.placeholder,
            value: this.state.lng == -1 && this.state.lat == -1 ? '' : `经度${this.state.lng} 纬度${this.state.lat}`
        };

        if (this.props.clear) {
            inputProps.addonAfter = <Icon type="close-circle-o" style={{ cursor: 'pointer' }} onClick={this.onClear} />;
        }

        return <Popover content={this.content} title="地理位置选择" trigger="focus">
            <Input {...this.props} {...inputProps} ></Input>
        </Popover>
    }

    onClear = () => {
        if (this.props.onChange) {
            this.props.onChange({
                target: {
                    value: undefined
                }
            });
        } else {
            this.setState({
                lng: -1,
                lat: -1
            });
        }

        if (this.map) {
            this.map.clearOverlays();
        }
    }

    get content() {
        const width = this.props.mapWidth;
        const height = this.props.mapHeight;
        return <div id='location-picker' style={{ width: width, height: height }} ref={this.onRef}></div>
    }
}

GeolocationPicker.geocodeSearch = function (address) {
    return new Promise((resolve, reject) => {
        var myGeo = new BMap.Geocoder();
        myGeo.getPoint(address, function (point) {
            if (point) {
                resolve({
                    lng: point.lng,
                    lat: point.lat
                });
            }
        }, "杭州市");
    });
}