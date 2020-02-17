<template>
    <div class="wrapper">
        <div class="title">个人信息</div>
        <van-cell-group>
            <van-field
                    v-model="formData.name"
                    :disabled="info || userInfo"
                    center
                    clearable
                    label="姓名"
                    placeholder="请输入姓名"
            >
            </van-field>
            <van-field
                    v-model="formData.idno"
                    :disabled="info || userInfo"
                    center
                    clearable
                    label="身份证号码"
                    placeholder="请输入身份证号码"
            >
            </van-field>
        </van-cell-group>
        <div class="title">手机号码</div>
        <van-cell-group>
            <van-field
                    id="image-field"
                    v-model="formData.pictureCode"
                    type="number"
                    center
                    clearable
                    label="图片验证码"
                    maxlength="11"
                    placeholder="请输入图形验证码答案"
            >
                <div slot="button">
                    <img @click="pictureEvent" @error="errorEvent" ref="image" :src="image" style="width: 88px;height: 30px;" alt="">
                </div>
            </van-field>
            <van-field
                    v-model="formData.mobile"
                    type="number"
                    center
                    clearable
                    label="手机号码"
                    maxlength="11"
                    placeholder="请输入手机号码"
            >
                <van-button :disabled="disabled" @click="sendEvent" slot="button" size="small" type="primary">{{btnText}}</van-button>
            </van-field>
            <van-field
                    v-model="formData.code"
                    type="number"
                    maxlength="8"
                    center
                    clearable
                    label="短信验证码"
                    placeholder="请输入短信验证码"
            >
            </van-field>
        </van-cell-group>

        <div class="center btn_box">
            <van-button :loading="loading" loading-text="加载中..." @click="checkEvent" style="width: 60%;" type="info">校验身份</van-button>
        </div>
    </div>
</template>

<script>
    import { login } from '@/services/indexService.js';
    // import { SETLOANLIST, SETUSERINFO } from '@/store/type.js';
    export default {
        name: "login",
        data: function () {
            return {
                btnText: '发送验证码',
                disabled: true,
                loading: false,
                isFinished: false,
                image: '',
                formData: {
                    pictureCode: '',
                    name: '',
                    idno: '',
                    mobile: '',
                    code: ''
                },
                info: this.$route.query.info,
                userInfo: this.$route.query.userInfo
            };
        },
        watch: {
            'formData.pictureCode': function (val) {
                if (val && this.formData.mobile) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            },
            'formData.mobile': function (val) {
                if (val && this.formData.pictureCode) {
                    this.disabled = false;
                } else {
                    this.disabled = true;
                }
            }
        },
        mounted () {
            // 从进件列表页面跳转过来
            if (this.info) {
                let userInfo = JSON.parse(this.info);
                this.formData.name = userInfo.name;
                this.formData.idno = userInfo.idNo;
            }
            // 第二次登陆，token过期，登陆验证
            if (this.userInfo) {
                let userInfo1 = JSON.parse(this.userInfo);
                this.formData.name = userInfo1.name;
                this.formData.idno = userInfo1.idNo;
            }
            // 获取图片验证码
            // this.pictureVerifyCode();
        },
        methods: {
            sendEvent () {
                this.sendVerifyCode();
            },
            pictureEvent () {
                this.pictureVerifyCode();
            },
            sendCode () {
                let _this = this;
                let init = 60;
                _this.disabled = true;
                let timer = setInterval(() => {
                    _this.btnText = init;
                    init--;
                    if (init <= 0) {
                        clearInterval(timer)
                        _this.btnText = '发送验证码';
                        _this.disabled = false;
                    }
                }, 1000);
            },
            pictureVerifyCode () {
                this.isFinished = false;
                pictureVerifyCode().then(res => {
                    this.isFinished = true;
                    let _this = this;
                    let blob = res;
                    let reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function(e){
                        _this.image = reader.result;
                    };
                })
            },
            errorEvent () {
                if (this.isFinished) {
                    this.$dialog.alert({
                        message: '发送图片验证码过于频繁，已超今日上限'
                    });
                    this.image = require('../../assets/nocode.png')
                }
            },
            sendVerifyCode () {
                let reg_mobile = /^1\d{10}$/;
                if (!reg_mobile.test(this.formData.mobile)) {
                    this.$toast("手机号填写不正确");
                    return
                }
                let data = {
                    mobile: this.formData.mobile,
                    pictureCode: this.formData.pictureCode
                };
                sendVerifyCode(data).then(res => {
                    // console.log(res);
                    if (res.success === 'true') {
                        this.sendCode();
                    }
                    if (res.success === 'false') {
                        this.formData.pictureCode = '';
                        this.pictureVerifyCode();
                    }
                });
            },
            isValidFormData () {
                let isValid = true;
                let reg_card = /^(\d{16}|\d{19})$/;
                let reg_name = /^[\u4e00-\u9fa5|·|•|.|●]+$/gi;
                let reg_idNo = /^([1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3})|([1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|[X|x]))$/;
                let reg_mobile = /^1\d{10}$/;
                let reg_code = /^\d{4,8}$/;
                // 如果不是this.info和this.userInfo,进行回显的不进行姓名和身份证校验
                if (!this.info && !this.userInfo) {
                    if (!reg_name.test(this.formData.name)) {
                        this.$toast("姓名填写不正确");
                        isValid = false;
                        return isValid;
                    }
                    if (!reg_idNo.test(this.formData.idno)) {
                        this.$toast("身份证号填写不正确");
                        isValid = false;
                        return isValid;
                    }
                }
                if (!reg_mobile.test(this.formData.mobile)) {
                    this.$toast("手机号填写不正确");
                    isValid = false;
                    return isValid;
                }
                if (!reg_code.test(this.formData.code)) {
                    this.$toast("验证码填写不正确");
                    isValid = false;
                    return isValid;
                }
                return isValid
            },
            login (data) {
                if (this.isValidFormData()) {
                    this.loading = true;
                    // 如果第一次登陆
                    login(data).then(res => {
                        this.loading = false;
                        if (res.success === 'true') {
                            localStorage.setItem('token_wxpay',res.result.token);
                            if (!res.result.data) {
                                this.$router.push('/authentication/fail');
                            } else {
                                this.$router.push('/loan/list');
                            }
                        }
                    })
                }
            },
            verifyIdentity () {
                if (this.isValidFormData()) {
                    this.loading = true;
                    let data = {
                        mobile: this.formData.mobile,
                        code: this.formData.code,
                        // pictureCode: this.formData.pictureCode
                    };
                    verifyIdentity(data).then(res => {
                        this.loading = false;
                        if (res.success === 'true') {
                            this.$router.push('/loan/list');
                        }
                    })
                }
            },
            checkEvent () {
                // 如果从列表页面跳过来, 走校验逻辑
                if (this.info) {
                    this.verifyIdentity();
                }
                // 如果token过期，而且第二次登陆，会把userInfo字段传递过来。
                if (this.userInfo) {
                    let data = {
                        mobile: this.formData.mobile,
                        code: this.formData.code,
                        // pictureCode: this.formData.pictureCode
                    }
                    this.login(data);
                }
                // 如果第一次登陆
                if (!this.info && !this.userInfo) {
                    let data = {...this.formData};
                    this.login(data);
                }
            }
        }
    }
</script>

<style scoped>
    .title {
        margin: 0;
        padding: 20px 15px;
        color: rgba(69, 90, 100, 0.6);
        font-weight: normal;
        font-size: 16px;
        background-color: #f1f1f1;
    }
    .btn_box {
        padding: 20px 15px;
    }
    #image-field .van-field__body div.van-field__button {
        height: 30px !important;
    }
</style>
