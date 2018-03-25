import React, { Component, PropTypes } from 'react';
import { HttpUtil } from 'djmodules-utils'
import { Modal, Button, message } from 'antd';
import Remote from './remote'
import TaskWindow from './task-window'

/**
 * excel导出
 */
class ExcelExport extends Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			visible: false,
			taskVisible: false,
			data: this.props.params
		}
		this.handleExportClick = this.handleExportClick.bind(this);
	}

	createExportJob() {
		let _this = this;

		//先获取一次数据
		Remote.getList(_this.state.data).then((json) => {
			var rdata = _this.state.data;
			rdata.resultObject = json.resultObject;
			_this.setState({
				data: rdata
			});

			const warning = () => {
				message.warning('不能重复执行多条同类型导出.', 5);
			};

			//如果不符合条件
			if (!json.complete) {
				warning()
				_this.setState({
					taskVisible: true
				});

			} else {
				Remote.addExportJob(this.state.data).then((json) => {
					_this.setState({
						taskVisible: true
					});
				})
			}
		});
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible == true) {
			this.setState({
				visible: nextProps.visible,
				taskVisible: false
			})
		}
		this.setState({
			data: nextProps.params
		})
	}

	shouldComponentUpdate(nextProps, nextState) {
		if (nextState.visible !== this.state.visible || nextState.taskVisible !== this.state.taskVisible) {
			return true
		}
		return false;
	}

	handleCancel = () => {
		this.setState({ visible: false }, () => {
			if (typeof this.props.onClose == 'function') {
				this.props.onClose()
			}
		});
	}

	handleHisClick = () => {
		this.setState({
			visible: false,
			taskVisible: true
		}, () => {
			if (typeof this.props.onClose == 'function') {
				this.props.onClose()
			}
		});
	}

	handleExportClick = () => {
		this.setState({
			visible: false
		}, () => {
			if (typeof this.props.onClose == 'function') {
				this.props.onClose()
			}
		});
		this.createExportJob()
	}

	render() {
		let _this = this;
		return (
			<div>
				<Modal
					maskClosable={false}
					visible={this.state.visible}
					title={this.props.params.jobName ? this.props.params.jobName : "导出Excel"}
					onCancel={this.handleCancel}
					footer={[
						<Button key="his" size="large" onClick={this.handleHisClick}>查看历史</Button>,
						<Button key="export" type="primary" size="large" onClick={this.handleExportClick}>
							立即导出
						</Button>,
					]}>
					<p>请选择您要执行的动作</p>
				</Modal>
				<TaskWindow data={this.state.data} visible={this.state.taskVisible} onClose={() => {
					_this.setState({
						taskVisible: false
					})
				}} />
			</div>
		);
	}
}
ExcelExport.PropTypes = {
	onClose: PropTypes.func
}
export default ExcelExport;