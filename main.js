
    /**
    1. Render songs    
    2. Scroll top
    3. Play / Pause / Seek
    4. CD rotage
    5. Next / prev
    6. Random
    7. Next / Repeat when ended
    8. Active song
    9. Scroll active song into view
    10. PLay song when click
    */

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    const PLAYER_STORAGE_KEY = 'F8_PLAYER';

    const heading = $('header h2');
    const cdthumb = $('.cd-thumb');
    const audio = $('#audio');
    const cd = $('.cd');
    const playBtn = $('.btn-toggle-play');
    const player = $('.player');
    const progress = $('#progress');
    const nextBtn = $('.btn-next');
    const prevBtn = $('.btn-prev');
    const ramdomBtn = $('.btn-random');
    const repeatBtn = $('.btn-repeat');
    const playlist = $('.playlist')

    const app = {
      currentIndex: 0,
      isPlaying: false,
      isRandom: false,
      isRepeat: false,

      config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
      setConfig: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
      },

      songs: [
          {
            name: "Ái Nộ",
            singer: "Masiu & Khôi Vũ",
            path: './assets/music/song1.mp3',
            image: './assets/img/img-1.jpg'
          },
          {
            name: "Cưới thôi",
            singer: "Masiu & Bray",
            path: './assets/music/song2.mp3',
            image: './assets/img/img-2.jpg'
          },
          {
            name: "Dịu dàng em đến",
            singer: "Erik",
            path: './assets/music/song3.mp3',
            image: './assets/img/img-3.jpg'
          },
          {
            name: "Thương thầm",
            singer: "Hoài Bão",
            path: './assets/music/song4.mp3',
            image: './assets/img/img-4.jpg'
          },
          {
            name: "Thê Lương",
            singer: "Phúc Chinh",
            path: './assets/music/song5.mp3',
            image: './assets/img/img-5.jpg'
          },
          {
            name: "Trưởng thành 2",
            singer: "Dee A",
            path: './assets/music/song6.mp3',
            image: './assets/img/img-6.jpg'
          },
          {
            name: "Độ tộc 2",
            singer: "Masiu,Độ Mixi,Phúc Du, Pháo",
            path: './assets/music/song7.mp3',
            image: './assets/img/img-7.jpg'
          },
          {
            name: "Đâu còn đây",
            singer: "LeeKenNal",
            path: './assets/music/song8.mp3',
            image: './assets/img/img-8.jpg'
          },
        ],
      
      render: function(){
        const htmls = this.songs.map((song, index )=> {
          return `
            <div class="song ${index ===this.currentIndex ? 'active' : ''}" data-index="${index}">
              <div class="thumb" style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>
          `
        })
        playlist.innerHTML = htmls.join('');
      },

      defineProperties: function(){
        Object.defineProperty(this,'currentSong',{//trong app tạo 1 property curentsong
          get: function(){
            return this.songs[this.currentIndex]//trả về bài hát thuộc inđẽ hiện tại
          }
        })
      },
      // getCurrentSong: function() {
      //   return this.songs[this.currentIndex]
      // },
      handelEvent: function(){
        const _this = this;

        //xử lý phóng to thu nhỏ CD
        document.onscroll = function(){//lắng nghe scroll của cả trang web
          // console.log(window.scrollY);
          // console.log(document.documentElement.scrollTop)//trả lại px tại vị trí mình kéo//dùng dòng này để code chạy được trên nhiều trình duyệt
          // kích thước cd - kích thước kéo lên
          // đã dùng pading-top làm ảnh vuôn nên chỉ cần giảm width là height sẽ giảm theo
          const cdWidth = cd.offsetWidth
          document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop //nếu cái này dùng ko dùng đc thì dùng cái khác
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
          }
        }

        //Xử lý cd quay / dừng
        const cdThumbAnimate = cdthumb.animate([
          { transform : 'rotate(360deg)' }  //đối số thứ 1 nhận 1 transform cách chuyển động
        ],{//đối số thứ 2 nhận các option
          duration: 10000,  // thời gian thực hiện hành động
          iterations: Infinity  // số lần lặp
        })
        cdThumbAnimate.pause();

        
        //Xử lý phóng to thu nhỏ
        playBtn.onclick = function(){
          if(_this.isPlaying){
            audio.pause();
          }else{
            audio.play()
          }
        }

        // khi bài hát được phát
        audio.onplay = function(){
          _this.isPlaying = true;
          player.classList.add('playing');
          cdThumbAnimate.play();
        }
        // khi bài hát bị dừng lại
        audio.onpause = function(){
          _this.isPlaying = false;
          player.classList.remove('playing');
          cdThumbAnimate.pause();
        }
        //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
          if(audio.duration){
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) //để lấy ra % bài hát ( = time hiện tại / tổng time * 100)
            progress.value = progressPercent
          }
        }

        //Xử lý khi tua song
        progress.onchange = function(){
          const seekTime = audio.duration / 100 * progress.value;
          audio.currentTime = seekTime
        }

        //Xử lý khi next song
        nextBtn.onclick = function(){
          if(_this.isRandom){
            _this.playRandomSong();
          }else{
            _this.nextSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();
        }

        //Xử lý khi prev song
        prevBtn.onclick = function(){
          if(_this.isRandom){
            _this.playRandomSong();
          }else{
            _this.prevSong();
          }
          audio.play();
          _this.render();
          _this.scrollToActiveSong();

        }

        //xử lý bật / tắt random
        ramdomBtn.onclick = function(){
          _this.isRandom = !_this.isRandom;
          _this.setConfig('isRandom',_this.isRandom);//set vào config
          ramdomBtn.classList.toggle('active',_this.isRandom);// đối số thứ 2 của toggle là boolean: false: add , true: xóa
        }

        //xử lý khi bật / tắt repeat
        repeatBtn.onclick = function(){
          _this.isRepeat = !_this.isRepeat;
          _this.setConfig('isRepeat',_this.isRepeat);//set vào config
          repeatBtn.classList.toggle('active',_this.isRepeat)
        }

        //Xử lý nextSong khi audio ended
        audio.onended = function(){
          if(_this.isRepeat){
            audio.play();
          }else{
            nextBtn.click(); // tự thực hiện hành động click
          }
        }

        // Lắng nghe hành vi click vào play list
        playlist.onclick = function(e){
          const songNode = e.target.closest('.song:not(.active)')
          // console.log(e.target) // lấy ra pt ở vị trí mà ta click vào
          if(songNode || e.target.closest('.option')){// khi pt ta click vào không có class active hoặc là option thì -> true
            //Xử lý khi click vào song
            if(e.target.closest('.song:not(.active)')){
              _this.currentIndex = Number(songNode.dataset.index)
              _this.loadCurrentSong();
              _this.render();
              audio.play()
            }
            //xử lý khi click vào song option
            if(e.target.closest('.option')){

            }

          }
        }

      },

      scrollToActiveSong: function(){
        setTimeout(()=> {
          $('.song.active').scrollIntoView({
            behavior: 'smooth', //chuyển động mượt
            block:'nearest',    //chuyển tới vijtris gần nhất có thể thấy
          })//tự dộng scroll vào view có tham số là 1 options chứa cách chuyển động
        }, 300)
      },
      
      loadCurrentSong: function(){
        heading.textContent = this.currentSong.name;
        cdthumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path;
      },
      loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
      },

      nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex > this.songs.length -1){
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
      },

      prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
          this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
      },
    

      //xử lý random bài hát
      playRandomSong: function(){
        let newIndex
        do{
          newIndex = Math.floor(Math.random() * this.songs.length) // do lenght đang trừ 1 nên phải làm tròn xuống floor
        }while(newIndex === this.currentIndex)
        this.currentIndex = newIndex;
        this.loadCurrentSong();
      },

      start: function(){
        //gán cấu hình từ config vào web
        this.loadConfig();
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe / xử lý các xự kiện (DOM events)
        this.handelEvent(); 

        //tải thông tin bài hát đầu tiên vào Ui khi chạy ứng dụng
        this.loadCurrentSong();
        
        // render playlist 
        this.render();

        repeatBtn.classList.toggle('active',this.isRepeat)
        ramdomBtn.classList.toggle('active',this.isRandom);

      }
    
      }
    
    app.start();

