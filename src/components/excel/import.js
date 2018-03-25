import React, { Component, PropTypes } from 'react';
import { HttpUtil } from 'djmodules-utils'
import { Upload, Icon, Modal, Button, message } from 'antd';
import Remote from './remote'
import TaskWindow from './task-window'
import ReportWindow from './report-window'


/**
 * excel导出
 */
class ExcelImport extends Component {

	constructor(props, context) {
		super(props, context);
		this.state = {
			visible: false,
			taskVisible: false,
			reportExceptons: [],
			reportRowErrors: [],
			reportVisible: false,
			reportDetail: {},
			reportComplete: false,
			data: this.props.params,
			fileName: "",
			disabled: true,
			importDisabled: true,
			checkInfo: "",
			importInfo: "",
			checkProgressPercent: "0%",
			importProgressPercent: "0%"
		}
		this.handleFileSelectedComplate = this.handleFileSelectedComplate.bind(this);
		this.handleImmediatelyToDBClick = this.handleImmediatelyToDBClick.bind(this);
		this.resumeScene = this.resumeScene.bind(this);
	}

	timer = null;

	uploader = null;

	startWith = (s, str) => {
		var reg = new RegExp("^" + str);
		return reg.test(s);
	}

	uploadExcel() {
		let signData = this.state.signData;
		if (this.startWith(location.href, "https://")) {
			signData.endpoint = signData.endpoint.replace("http://", "https://");
		}
		let data = this.state.data;
		let _this = this;

		if (this.uploader != null) {
			return this.uploader;
		}

		if (this.startWith(location.href, "https://")) {
			signData.endpoint = signData.endpoint.replace("http://", "https://");
		}

		//初始化控件
		this.uploader = new plupload.Uploader({
			multi_selection: false,	//单文件
			runtimes: 'html5,flash,silverlight,html4',
			browse_button: this.refs["excelFile"],
			flash_swf_url: _path + '/assets/globals/plupload/js/Moxie.swf',
			silverlight_xap_url: _path + '/assets/globals/plupload/js/Moxie.xap',
			url: signData.endpoint,
			multipart_params: {
				'Filename': signData.fileName,
				'key': signData.dir + "/" + signData.fileName,
				'policy': signData.policyBase64,
				'OSSAccessKeyId': signData.accessId,
				'success_action_status': '200', //让服务端返回200,不然，默认会返回204
				'signature': signData.signature,
			},

			// 只能上传指定格式excel,允许上传同样的excel
			filters: {
				max_file_size: '100mb',
				mime_types: [{
					title: "Excel files",
					extensions: "xlsx,xls"
				}],
				prevent_duplicates: false
			},

			init: {

				FilesAdded: function (up, files) {
					_this.handleFileSelectedComplate(up, files[0]);
				},
				UploadProgress: function (up, file) {
					// console.log(JSON.stringify(file))
					let percent = file.percent;
					percent = percent <= 100 ? percent + '%' : '';
					_this.setState({
						percent: percent
					});
				},
				FileUploaded: function (up, file, info) {
					if (info.status == 200) {
						let signData = _this.state.signData;

						data.outFilePath = signData.endpoint + signData.dir + "/" + signData.fileName
						// console.log("文件路径：" + data.outFilePath);
						_this.setState({
							disabled: false,
							importDisabled: false
						});

					} else {
						// console.log("上传失败,失败文件名为" + file.name);
					}
				},
				Error: function (up, err) {
					var txt;
					if (err.code == '-602') {
						txt = '请勿选择相同或使用过的文件';
					} else if (err.code == '-601') {
						txt = '请选择.xlsx文件或.xls文件';
					} else if (err.code == '-600') {
						txt = '请勿选择大于5MB（兆）的文件'
					} else {
						message.error(err.response);
					}

					if (null != txt) {
						message.error(txt);
					}
				}

			}
		});

		this.uploader.init();

		return this.uploader;
	}

	clearFile = () => {

		const confirm = Modal.confirm;
		const _this = this;
		//确认框
		confirm({
			title: '确定要取消吗?',
			content: '这样做会终止正在导入的任务',
			onOk() {
				//停止心跳
				_this.stopTime();
				//停止任务
				Remote.delJob(_this.state.data).then((json) => {
					if (json.status == "success") {
						//清理内容
						_this.setState({
							checkInfo: null,
							importInfo: null,
							fileName: "",
							disabled: true,
							importDisabled: true,
							reportComplete: false,
							reportDetail: {},
							reportExceptons: [],
							reportRowErrors: []
						});
					} else {
						message.error(json.exceptionMessage);
					}
				});
			},
			onCancel() {
				console.log('Cancel');
			},
		});

	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible == true) {
			this.state.data.jobId = null;

			this.setState({
				visible: nextProps.visible
			})
		}

		let _this = this
		if (nextProps.visible) {
			if (this.uploader == null) {
				Remote.signature().then((json) => {
					let signData = json.resultObject;
					_this.setState({
						signData: signData
					});
					_this.uploadExcel()
				});
			}

			//检查有无未完任务
			Remote.getList(this.state.data).then((json) => {
				//有历史任务
				if (!json.complete) {
					//恢复现场
					_this.resumeScene(json.resultObject[0].jobId)
				} else {
					_this.setState({
						reportComplete: false,
						taskVisible: false,
						reportVisible: false,
						disabled: true,
						importDisabled: true,
						fileName: "",
						checkInfo: "",
						importInfo: ""
					});
				}
			});
		}
	}

	//关闭主窗体
	handleCancel = () => {
		this.setState({
			visible: false
		});
		this.stopTime();
		// this.uploader.destroy();
		if (typeof this.props.onClose == 'function') {
			this.props.onClose();
		}
	}

	//恢复现场
	resumeScene(jobId) {
		this.state.data.jobId = jobId;
		let _this = this;
		Remote.getDetail(this.state.data).then((jobAtom) => {
			if (jobAtom == null) {
				return
			}
			if (jobAtom.scene == null || jobAtom.scene == "") {
				jobAtom.scene = "{}";
			}

			let scene = Object.assign(_this.state, JSON.parse(jobAtom.scene));

			//恢复现场
			_this.setState(scene);
			//启动心跳
			_this.startTime();
		});


	}

	//直接落库模式导入
	handleImmediatelyToDBClick = () => {

		let _this = this;

		this.setState({
			disabled: true,
			importDisabled: true,
			importProgressPercent: "0%",
			importInfo: "导入中...",
			reportComplete: false
		}, () => {
			this.state.data.mode = 2;
			let scene = JSON.parse(JSON.stringify(this.state))
			delete scene.visible
			delete scene.taskVisible
			delete scene.reportVisible
			delete scene.reportDetail
			delete scene.reportExceptons
			delete scene.reportRowErrors
			delete scene.signData
			scene = JSON.stringify(scene)
			if (this.state.data.jobId == null) {
				//不存在情况，新增加一条任务
				Remote.addImportJob(this.state.data, scene).then((json) => {
					if (json.status == "success") {
						_this.state.data.jobId = json.resultObject;
						_this.setState({
							data: _this.state.data
						});
						_this.startTime();
					}
				});
			} else {
				//已存在情况，立即调用后台去执行
				Remote.runImportJob(this.state.data, scene).then((json) => {
					if (json.status == "success") {
						_this.setState({
							data: _this.state.data,
							importInfo: "导入中...",
						});

						_this.startTime();
					}
				});
			}

		});
	}

	//仅校验
	handleImportCheckClick = () => {
		let _this = this;

		this.setState({
			disabled: true,
			importDisabled: true,
			checkProgressPercent: "0%",
			checkInfo: "校验中...",
			reportComplete: false
		}, () => {
			if (this.state.data.jobId == null) {
				this.state.data.mode = 1;
				let scene = JSON.parse(JSON.stringify(this.state))
				delete scene.visible
				delete scene.taskVisible
				delete scene.reportVisible
				delete scene.reportDetail
				delete scene.reportRowErrors
				delete scene.reportExceptons
				delete scene.signData
				scene = JSON.stringify(scene)
				Remote.addImportJob(this.state.data, scene).then((json) => {
					if (json.status == "success") {
						_this.state.data.jobId = json.resultObject;
						_this.setState({
							data: _this.state.data
						});
						_this.startTime();
					}
				});
			} else {
				//发起监控
				_this.startTime();
			}
		});
	}

	//文件选择完成后续处理
	handleFileSelectedComplate = (up, file) => {

		if (file.type != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && file.type != "application/vnd.ms-excel") {
			message.info("请选择xls,xlsx文件");
			return false;
		}

		let _this = this

		//检查有无未完任务
		Remote.getList(this.state.data).then((json) => {
			//有历史任务
			if (!json.complete) {
				message.warning('不能重复执行多条同类型导入.');
				if (_this.state.data.jobId == null) {
					_this.resumeScene(json.resultObject[0].jobId);
				}
			} else {//没有历史任务,直接开始上传文件
				//重置文件信息
				if (file.type == "application/vnd.ms-excel") {//xls文件
					let newFileName;
					let signData = _this.state.signData;
					newFileName = signData.fileName.replace(/.xlsx/, '.xls');
					_this.setState({
						signData: Object.assign({}, signData, {
							fileName: newFileName
						})
					});
					up.settings.multipart_params.Filename = newFileName;
					up.settings.multipart_params.key = signData.dir + '/' + newFileName;
				}
				//重置状态
				_this.state.data.jobId = null;

				_this.setState({
					fileName: file.name,
					checkInfo: null,
					importInfo: null,
					percent: "0%",
					checkProgressPercent: "0%",
					importProgressPercent: "0%",
					data: _this.state.data
				});
				_this.uploader.start();
			}
		});

	}

	loadData = () => {
		let _this = this;

		Remote.getDetail(this.state.data).then((json) => {
			if (json == null) {
				_this.stopTime();
				return;
			}

			_this.setState({
				reportDetail: json
			});

			_this.state.data.jobId = json.jobId;

			if (_this.state.data.mode == 1) {
				_this.setState({
					checkProgressPercent: (json.percent ? json.percent : "0") + "%"
				});
			} else {
				_this.setState({
					importProgressPercent: (json.percent ? json.percent : "0") + "%"
				});
			}

			//被标记成已完成
			if (json.complete) {
				_this.stopTime();
				if (_this.state.data.mode == 1) {
					//并检测到有异常
					if (json.excelStatus == 2) {
						_this.setState({
							checkInfo: <span style={{ color: "red" }}>校验到错误</span>
						});
					} else {
						_this.setState({
							checkInfo: "校验完成"
						});
					}
				} else {
					//并检测到有异常
					if (json.excelStatus == 2) {
						_this.setState({
							importInfo: <span style={{ color: "red" }}>导入出错了</span>
						});
					} else {
						_this.setState({
							importInfo: "导入完成"
						});
					}

				}
				let reportExceptons = [];
				let reportRowErrors = [];

				if (json.excelStatus == 2) {
					Remote.getReport(json.jobId).then((result) => {
						if (typeof (result.resultObject) == "string") {
							result = JSON.parse(result.resultObject)
						} else {
							result = result.resultObject ? result.resultObject : {}
						}
						if (result.errors) {
							for (let i = 0; i < result.errors.length; i++) {
								let element = result.errors[i];
								reportRowErrors.push(element)
							}
						}
						if (result.exceptionErrors) {
							for (let i = 0; i < result.exceptionErrors.length; i++) {
								reportExceptons.push(<p>{result.exceptionErrors[i]}</p>);
							}
						}
						//报告框弹出，报告按钮可点
						_this.setState({
							reportComplete: true,
							reportVisible: true,
							reportExceptons: reportExceptons,
							reportRowErrors: reportRowErrors,
						});

					});
				} else {
					//导入按钮亮起，报告窗弹出
					_this.setState({
						reportVisible: true,
						importDisabled: false,
						reportExceptons: reportExceptons,
						reportRowErrors: reportRowErrors,
					});
				}
			}
		});
	}

	startTime = () => {
		let _this = this;
		_this.loadData();
		if (this.timer == null) {
			this.timer = setInterval(function () {
				_this.loadData();
			}, 3000);
		}
	}

	stopTime = () => {
		window.clearInterval(this.timer);
		this.timer = null
	}

	render() {
		let _this = this;
		const needCheck = this.props.needCheck ? this.props.needCheck : false;
		return (
			<div >
				<Modal
					maskClosable={false}
					visible={this.state.visible}
					title={this.props.params.jobName ? this.props.params.jobName : "导入Excel"}
					onCancel={this.handleCancel}
					footer={[
						<Button key={0} size="large" disabled={!this.state.reportComplete}
							onClick={() => {
								_this.setState({ reportVisible: true })
							}} >
							查看报告
						</Button>,
						<Button key={1} disabled={this.state.disabled}
							style={{ display: needCheck ? "inline" : "none" }} type="primary" size="large"
							onClick={this.handleImportCheckClick} title={"该动作会先对数据进行校验,依据校验结果用户可以选择以何种策略写入系统。"}>
							校验
						</Button>,
						<Button key={2} disabled={this.state.importDisabled} type="primary" size="large"
							onClick={this.handleImmediatelyToDBClick} title={"该动作会直接将正确的信息直接写入系统，错误的数据直接忽略。"}>
							直接导入
						</Button>
					]}>
					<div ref="uploadDiv" className="excel" >
						<div style={{ position: "relative", padding: "0 10px 10px 10px" }}>
							<p>导入文件仅支持xls、xlsx文件</p>
							<p>
								<span>请按照规定格式上传，否则无法上传成功</span>
								<a href={this.props.templatePath} style={{ marginLeft: 10 }}>模板下载</a>
							</p>
						</div>
						<div style={{ position: "relative", padding: "10px", borderTop: "1px solid #ddd" }}>
							<div className="fileSelect"
								style={{
									position: "absolute", border: "1px #49a9ee solid",
									padding: "5px 10px", color: "#49a9ee",
									marginLeft: 10, borderRadius: 3
								}}>
								{this.state.fileName ? "重新选择文件..." : "选择文件..."}
							</div>
							<input id="excelFile" ref="excelFile" type="file" name="excelFile"
								style={{ opacity: 0, marginLeft: 10, width: 90, height: 30 }} />
						</div>
						<div style={{ height: 75, padding: "10px 10px 0 10px", borderTop: "1px solid #ddd" }}>
							<div style={{ position: "relative", display: this.state.fileName ? "block" : "none" }}>
								<span style={{ marginRight: 20 }}>
									{this.state.fileName}
								</span>
								<span style={{ color: "blue" }}>{this.state.percent}</span>
								<span style={{ marginLeft: 20 }}><a style={{ color: "red" }} onClick={this.clearFile}>取消</a></span>
							</div>
							<div style={{ position: "relative", paddingTop: "10px", display: this.state.checkInfo ? "block" : "none" }}>
								<span style={{ marginRight: 20 }}>{this.state.checkInfo}</span>
								<span style={{ color: "blue" }}>{this.state.checkProgressPercent}</span>
							</div>
							<div style={{ position: "relative", paddingTop: "10px", display: this.state.importInfo ? "block" : "none" }}>
								<span style={{ marginRight: 20 }}>{this.state.importInfo}</span>
								<span style={{ color: "blue" }}>{this.state.importProgressPercent}</span>
							</div>
						</div>
					</div>
				</Modal>
				<ReportWindow visible={this.state.reportVisible}
					task={this.state.data}
					handleImmediatelyToDB={this.handleImmediatelyToDBClick}
					reportDetail={this.state.reportDetail}
					reportRowErrors={this.state.reportRowErrors}
					reportExceptons={this.state.reportExceptons}
					onClose={() => {
						_this.setState({ reportVisible: false })
					}} />
				<TaskWindow
					data={this.state.data}
					visible={this.state.taskVisible}
					onClose={() => { _this.setState({ taskVisible: false }) }} />

			</div >
		);
	}
}
ExcelImport.PropTypes = {
	onClose: PropTypes.func
}
export default ExcelImport;
