<template>
	<view class="content">
		  <mpvue-city-picker :themeColor="themeColor" ref="mpvueCityPicker" :pickerValueDefault="cityPickerValueDefault"
		 @onConfirm="onConfirm"></mpvue-city-picker>
		
		<view class="row b-b">
			<text class="tit">联系人</text>
			<input class="input" type="text" v-model="addressData.name" placeholder="收货人姓名" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">手机号</text>
			<input class="input" type="number" v-model="addressData.phone" placeholder="收货人手机号码" placeholder-class="placeholder" />
		</view>
		<view class="row b-b" @click="showMulLinkageThreePicker">
			<text class="tit">区域</text>
			<input class="input" type="text"  v-model="addressData.area" disabled="true"   placeholder-class="placeholder" />
		</view>
		<!-- <view class="list-cell b-b" hover-class="cell-hover" :hover-stay-time="50">
			 
			 <text class="cell-tit"  >注册区域</text>
			 
			 <input class="input" type="text" v-model="pickerText" @click="showMulLinkageThreePicker"  placeholder-class="placeholder" />
		</view> -->
		
		<view class="row b-b">
			<text class="tit">地址</text>
			<input class="input" type="text" v-model="addressData.detailed" placeholder="详细地址" placeholder-class="placeholder" />
			<!-- <text @click="chooseLocation" class="input">
				{{addressData.addressName}}
			</text>
			<text class="yticon icon-shouhuodizhi"></text> -->
		</view>
		<view class="row b-b"> 
			<text class="tit">门牌号</text>
			<input class="input" type="text" v-model="addressData.houseNumber" placeholder="楼号、门牌(选填)" placeholder-class="placeholder" />
		</view>
		
		<view class="row default-row">
			<text class="tit">设为默认</text>
			<switch :checked="addressData.status == 1" color="#fa436a" @change="switchChange" />
		</view>
		<button class="add-btn" @click="confirm">提交</button>
	</view>
</template>

<script>

	 
	import mpvueCityPicker from '@/components/mpvue-citypicker/mpvueCityPicker.vue'
/* 	import cityData from '@/components/city.data.js';
	import cityData3 from '@/components/city.data-3.js'; */
	
	export default {
		components: {
		    mpvueCityPicker,
		},
		data() {
			return {
			edit_city_picker:true,
			cityPickerValueDefault: [0, 0, 1],
			themeColor: '#007AFF',
			
				addressData: {
					pickerText: '',
					name: '',
					mobile: '',
					addressName: '',
					address: '',
					area: '',
					default: false
				},
				addressList:[],
			}
		},
		onLoad(option){
			this.loadAddress();
			let title = '新增收货地址';
			if(option.type==='edit'){
				
			}

			if(!!option.id){
				title = '编辑收货地址';
				this.locateAddress(option.id)
				
			}
			uni.setNavigationBarTitle({ 
				title
			})
		},
		methods: {
		onConfirm(e) {
				console.log(e);
				 this.addressData.area=e.label;
				 console.log( this.addressData)
			},
			
			showMulLinkageThreePicker() {		
			    this.$refs.mpvueCityPicker.show()
			},
			locateAddress(_id){
				var li=this.addressList;
				for(var i in li){
					var ite=li[i];
					if(parseFloat(ite.id)===parseFloat(_id)){
						this.addressData=ite;
					}
				}
				console.log(this.addressData)
			},
			loadAddress(){
				let _this=this;
				this.addressList=this.$dataLocal("address")||[];
			},
			
			switchChange(e){
				console.log(e.detail)
				var li =this.addressList;
				console.log(true===e.detail.value)
				if(true===e.detail.value){
					
					for(let i in li){
						let ite=li[i];
						ite.default=false;
					}
				}
				console.log(li);
				this.addressData.default = e.detail.value;
			},
			
			//地图选择地址
			chooseLocation(){
				uni.chooseLocation({
					success: (data)=> {
						this.addressData.area = data.name;
						// this.addressData.address = data.name;
					}
				})
			},
			
			//提交
			confirm(){
				let li=this.addressList;
				let data = this.addressData;
				if(!data.name){
					this.$toast('请填写收货人姓名');
					return;
				}
				if(!/(^1[3|4|5|7|8|9][0-9]{9}$)/.test(data.phone)){
					this.$toast('请输入正确的手机号码');
					return;
				}
				
				if(!data.area){
					this.$toast('请选择所在区域');
					return;
				}
				if(!data.detailed){
					this.$toast('请填写详细地址');
					return;
				}
				if(!data.houseNumber){
					this.$toast('请填写门牌号信息');
					return;
				}
				
				if(typeof data.id!="undefined"){
					for(let i in li){
						var ite=li[i];
						if(parseFloat(ite.id)===parseFloat(data.id)){
							ite=data;
							// 执行修改
							uni.request({
								url:'http://localhost:8888/codeworld-member/address/update-receiver-address',
								method:'POST',
								header:{'token':this.$dataLocal("token")},
								data:JSON.stringify(ite),
								success: (response) => {
									if(response.data.code === 20000){
										this.$toast(response.data.msg);
										this.$dataLocal("address",li);
										setTimeout(()=>{
											uni.navigateBack()
										}, 800)
									}else{
										this.$toast(response.data.msg);
									}
								}
							})
						}
					}
				}else{
				  let member = this.$dataLocal("user_info");
				  data.memberId = member.memberId
					// 添加地址
					uni.request({
						url:'http://localhost:8888/codeworld-member/address/add-receiver-address',
						header:{'token':this.$dataLocal("token")},
						method:'POST',
						data:JSON.stringify(data),
						success: (response) => {
							if(response.data.code === 20000){
								this.$toast(response.data.msg);
								li.push(data);
								this.$dataLocal("address",li);
								setTimeout(()=>{
									uni.navigateBack()
								}, 800)
							}else{
								this.$toast(response.data.msg);
							}
						}
					})
				}
			},
		}
	}
</script>

<style lang="scss">
	page{
		background: #f1f1f1;
		padding-top: 16upx;
	}

	.row{
		display: flex;
		align-items: center;
		position: relative;
		padding:0 30upx;
		height: 110upx;
		background: #fff;
		
		.tit{
			flex-shrink: 0;
			width: 120upx;
			font-size: 30upx;
			color: #303133;
		}
		.input{
			flex: 1;
			font-size: 30upx;
			color: #303133;
		}
		.icon-shouhuodizhi{
			font-size: 36upx;
			color: #909399;
		}
	}
	.default-row{
		margin-top: 16upx;
		.tit{
			flex: 1;
		}
		switch{
			transform: translateX(16upx) scale(.9);
		}
	}
	.add-btn{
		display: flex;
		align-items: center;
		justify-content: center;
		width: 690upx;
		height: 80upx;
		margin: 60upx auto;
		font-size: 32upx;
		color: #fff;
		background-color: #fa436a;
		border-radius: 10upx;
		box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
	}
</style>
