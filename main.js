const BootBot = require('bootbot')
const request = require('request')
const dateformat = require('dateformat')

const bot = new BootBot({
  accessToken: process.env.ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
  
})

process.env.TZ = 'Asia/Jakarta'

bot.on('message', (payload, chat)=>{
    console.log(payload)
    chat.getUserProfile().then((user)=>{
    var nama = user.first_name == null ? `` : user.first_name,
        sapa = user.gender == `male` ? `Mas` : `Mbak`,
        msg = payload.message.text.toLowerCase(),
        msga = payload.message.text,
        text = msg.replace(/\s\s+/g, ' '),
        teks = text.split(" "),
        awal = teks[0],
        akhir = teks[1],
        semua = `${text}`.substr(`${text}`.indexOf(" ") + 1),
        smbesok = `${text}`.substr(`${text}`.indexOf(" ") + 7)
        
        switch (awal) {
        
          case 'hai': case 'hei': case 'hallo': case 'hello': case 'ok': case 'okk': case 'oke':
              chat.say(`${msga} juga ${sapa} ${nama}...`)
          break;
            
          case 'makasih': case 'thanks': case 'thank': case 'mksh': case 'terimakasih': case 'trims': case 'trimakasih':
              chat.say(`👍 Sama-sama ${sapa}...`)
          break;
            
          case (awal.match(/^assalamu/) || {}).input:
              chat.say(`Wa'alaikumussalam ${sapa}...`)
          break;
            
          case (awal.match(/ping/) || {}).input:
          const DateDiff = require('date-diff')
          var date1 = new Date(),
              date2 = new Date(payload.timestamp),
              diff = new DateDiff(date1, date2) .seconds(),
              selisih = diff < 1 ? `` : `\n\nAda Jeda sekitar ${Math.floor(diff)} detik.`
          
              console.log(selisih)

            chat.say(`PONG!! ${selisih}`, {typing: true})
          break;
            
          case 'invite':
              chat.say(`Silahkan share link/url m.me/idsholat ke temanmu...`)
          break;
          
          case 'status':
              console.log(user)
              var JK = user.gender == `male` ? `👨 Laki-Laki` : `👩 Perempuan`,
                  nama2 = user.last_name == null ? `` : user.last_name
              chat.say(`Nama: ${nama} ${nama2}\nJK: ${JK}\nID: ${user.id}`)
              chat.say({
                      attachment: 'image',
                      url: user.profile_pic
              })
          break; 
            
          case 'help': case 'bantuan':
            var sh = `Cara menampilkan Jadwal Sholat / Imsakiyah untuk Kab/Kota seluruh Indonesia. `
                sh += `\n\nJadwal Sholat Hari ini :\n~~~~~~~~~~~~~~~~~~~~\n  sholat [kab/kota] atau \n  sholat [kode kab/kota]\n\ncontoh: \n  sholat demak atau \n  sholat 713`
                sh += `\n\nJadwal Sholat Besok :\n~~~~~~~~~~~~~~~~~~~~\n  sholat besok [kab/kota] atau \n  sholat besok [kode kab/kota] \n\ncontoh: \n  sholat besok demak atau \n  sholat besok 713`
                sh += `\n\n\nPerintah Lain:\n~~~~~~~~~~~~~~~~~~~~\nPING untuk tes koneksi server.\nSTATUS untuk cek status Facebook.`
                chat.say({
                         text: `${sh}`, 
                         quickReplies:[' PING ', ' STATUS ', ' INVITE ']                         
                         })
          break;
          
          case (awal.match(/sholat|shalat|solat|salat/) || {}).input:
            //const query = semua;
          if ( akhir == null ) {
              var sh = `Cara menampilkan Jadwal Sholat / Imsakiyah untuk Kab/Kota seluruh Indonesia. `
                  sh += `\n\nJadwal Sholat Hari ini :\n~~~~~~~~~~~~~~~~~~~~\n  sholat [kab/kota] atau \n  sholat [kode kab/kota]\n\ncontoh: \n  sholat demak atau \n  sholat 713`
                  sh += `\n\nJadwal Sholat Besok :\n~~~~~~~~~~~~~~~~~~~~\n  sholat besok [kab/kota] atau \n  sholat besok [kode kab/kota] \n\ncontoh: \n  sholat besok demak atau \n  sholat besok 713`
                  chat.say(`${sh}`, {typing: true})
          } else {
            //chat.say(`Sebentar ya ${sapa} ${nama}... \nData sedang di proses....`)
            
            var tgl = (akhir == 'besok') ? dateformat(new Date(Date.now ()+ 24*60*60*1000), 'yyyy-mm-dd') :dateformat(new Date(),"yyyy-mm-dd" ),
                query = (akhir == 'besok') ? smbesok : semua,
                kunci = isNaN(query) ? `nama` : `kode`
      
              var url = 'http://api.banghasan.com/sholat/format/json/kota/'+ kunci + '/'+ query
                 request(url, function (error, response, body){
                 if (error) {
                    chat.say('Maaf, lagi ada gangguan system')
                 } else {
                   var kota = JSON.parse(body)
                   if ( kota.kota == 0) {
                      chat.say(`Jadwal Sholat untuk ${query} tidak tersedia atau Anda mungkin salah ketik nama Kota/Kabupaten, Untuk nama kabupaten cukup di tulis namanya saja tanpa penulisan Kab. atau Kabupaten.`, {typing: true})
                   } else {
                     chat.say(`Sebentar ya ${sapa} ${nama}, data sedang di proses...`)
                     var jml = kota.kota,
                         kode = kota.kota[0].id,
                         nkota = kota.kota[0].nama,
                         dfkota =''

                         if (jml.length == 1) {
                           var dkota = '\n\nSumber: Web Kementrian Agama RI'
                         } else {
                           for (var i = 1; i < jml.length; i++)
                               dfkota += `  ${kota.kota[i].id}: ${kota.kota[i].nama}\n`,
                               dkota = `\n\nPilihan Lain:\n\n${dfkota}\nSumber: Web Kementrian Agama RI`
                         }
                           var urljdwl = 'http://api.banghasan.com/sholat/format/json/jadwal/kota/'+ `${kode}`+'/tanggal/' + `${tgl}`
                               request(urljdwl, function (error, response, body){
                               if (error) {
                                    chat.say('Maaf, lagi ada gangguan system')
                               } else {
                                    var sholat = JSON.parse(body),
                                        tgl = sholat.jadwal.data.tanggal,
                                        imsak = sholat.jadwal.data.imsak,
                                        shubuh = sholat.jadwal.data.subuh,
                                        terbit = sholat.jadwal.data.terbit,
                                        dhuha = sholat.jadwal.data.dhuha,
                                        dzuhur = sholat.jadwal.data.dzuhur,
                                        ashar = sholat.jadwal.data.ashar,
                                        maghrib = sholat.jadwal.data.maghrib,
                                        isya = sholat.jadwal.data.isya

                                    var jadwalsholat = `Jadwal Waktu Sholat ( ${tgl} ) untuk wilayah ${nkota} [ ${kode} ] dan sekitarnya.\n\n`
                                        jadwalsholat += `★ Imsak        ${imsak}\n☆ Shubuh     ${shubuh}\n★ Terbit         ${terbit}\n`
                                        jadwalsholat += `☆ Dhuha       ${dhuha}\n★ Dzuhur      ${dzuhur}\n☆ Ashar        ${ashar}\n`
                                        jadwalsholat += `★ Maghrib    ${maghrib}\n☆ Isya'          ${isya}${dkota}`

                                    chat.say(jadwalsholat, {typing: true})

                               }
                        })
                    }
                }
            }) 
          }
          break;
            
          default:
            chat.say(`😊`, {typing: true})
            chat.say(`🙏 Silahkan ketik HELP atau BANTUAN ${sapa} ${nama}`, {typing: true})
          break;
            
        } //akhir Switch
    }) //Akhir Profile
})

bot.on('attachment', (payload, chat)=>{
  console.log(payload)
  chat.say(`😊`, {typing: true})
})

bot.start()

