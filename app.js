//app.js
App({
  globalData:{
    workText: ['作品1', '作品2', '作品3', '作品4', '作品5', '作品6', '作品7', '作品8', '作品9', '作品10', '作品11', '作品12'],
    hucaiApi: 'http://basic.wh.com/',
    cosApi: 'https://29858960.qcloud.la/',
  },
  onLaunch: function() {
    var _this = this
    wx.showToast({
      title: '登陆中...',
      mask: true,
      icon: 'loading',
      duration: 60000
    });
    var userinfo = wx.getStorageSync('userinfo');
    if(userinfo){
      // console.log('读取storage数据');
      // console.log(userinfo);
      wx.hideToast();
    }else{
      wx.login({
        success: function(res) {
          // console.log(res)
          var code = res.code;
          if (code) {
            console.log('获取用户登录凭证：' + code);
            wx.getUserInfo({  //得到rawData, signatrue, encryptData
              success: function(data){
                // console.log(data)
                var rawData = data.rawData;
                var signature = data.signature;
                var encryptedData = data.encryptedData; 
                var iv = data.iv;
                wx.request({
                  url: _this.globalData.hucaiApi+'weapp/login',
                  data: {
                    "code" : code,
                    "rawData" : rawData,
                    "signature" : signature,
                    'iv' : iv,
                    'encryptedData': encryptedData
                  },
                  method: 'GET', 
                  success: function(info){
                    // console.log(info)
                    if(info.statusCode == 200){
                      var data = info.data
                      if(data.code == 200){
                        console.log('查询所得数据');
                        userinfo = JSON.stringify(data.data)
                        wx.setStorageSync('userinfo', userinfo)
                        console.log(userinfo);
                        wx.hideToast();
                      }else{
                        wx.showToast({
                          title: data.description || '登陆失败',
                          mask: true,
                          icon: 'loading',
                          duration: 6000
                        });
                      }
                    }else{
                      wx.showToast({
                        title: info.errMsg,
                        mask: true,
                        icon: 'loading',
                        duration: 6000
                      });
                    }
                  }
                })
              }
            })

          } else {
            console.log('获取用户登录态失败：' + res.errMsg);
          }
        }
      });
    }
  }
})