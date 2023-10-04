$(function () {
    let config = {
      apiKey: "AIzaSyA5lTYnpK5UvXqovsDHbBDNdEugtHGXXuU",
      authDomain: "image-editor-2f1dc.firebaseapp.com",
      databaseURL: "https://image-editor-2f1dc.firebaseio.com",
      projectId: "image-editor-2f1dc",
      storageBucket: "",
      messagingSenderId: "154243994182"
    };
    // Firebaseの設定情報を使ってFirebaseを初期化します。
    firebase.initializeApp(config);
    // クラスが "tools" の要素をドラッグ可能にします。
    $(".tools").draggable();
    // URLから取得したパラメータ 'id' を使用して、ルームIDを取得します。
    // パラメータが存在しない場合、デフォルトの値 "prueba" を使用します。
    let roomID = getUrlParameter('id') || "prueba";
    // ユーザーの一意のIDを生成します。
    let uID = Math.floor(Math.random() * 100000).toString();
    // Firebaseデータベースへの参照を作成します。
    let db = firebase.database();
    // 'rooms' というデータベース内の参照を作成します。
    let rooms = db.ref('rooms');
    // 現在のルームに対する参照を作成します。
    let currentRoom = rooms.child(roomID);
    // 現在の時間をミリ秒単位で取得します。
    let now = Date.now();
    // fabric.jsを使用してキャンバスを作成します。
    let canvas = new fabric.Canvas('canvas', {
      isDrawingMode: true
    });
    // キャンバス上のオブジェクトを選択不可に設定します。
    canvas.selection = false;
    // 描画の色と線の幅を制御するための要素を取得します。
    let drawingColor = $('#drawing-color'),
      drawingLineWidth = $('#drawing-line-width');
    // Circle（円）オブジェクトの定義と操作用の関数を作成します。
    var Circle = (function () {
      function Circle(canvas) {
        this.canvas = canvas;
        this.className = 'Circle';
        this.isDrawing = false;
        this.isActive = false;
        this.bindEvents();
      }
      let origX, origY;
      // イベントハンドラーをバインドします。
      Circle.prototype.bindEvents = function () {
        let inst = this;
        inst.canvas.on('mouse:down', function (event) {
          if (inst.isActive) inst.onMouseDown(event);
        });
        inst.canvas.on('mouse:move', function (event) {
          if (inst.isActive) inst.onMouseMove(event);
        });
        inst.canvas.on('mouse:up', function (event) {
          if (inst.isActive) inst.onMouseUp(event);
        });
        inst.canvas.on('object:moving', function () {
          if (inst.isActive) inst.disable();
        });
      };
      // マウスがアップしたときの処理を行います。
      Circle.prototype.onMouseUp = function () {
        let inst = this;
        if (inst.isEnable()) canvas.fire('object:finish', {
          target: inst.canvas.getActiveObject()
        });
        inst.disable();
      };
      Circle.prototype.onMouseMove = function (event) {
        let inst = this;
        if (!inst.isEnable()) {
          return;
        }
        let pointer = inst.canvas.getPointer(event.e);
        let activeObj = inst.canvas.getActiveObject();
        if (origX > pointer.x) {
          activeObj.set({
            left: Math.abs(pointer.x)
          });
        }
        if (origY > pointer.y) {
          activeObj.set({
            top: Math.abs(pointer.y)
          });
        }
        activeObj.set({
          rx: Math.abs(origX - pointer.x) / 2,
          ry: Math.abs(origY - pointer.y) / 2,
          width: Math.abs(origX - pointer.x),
          height: Math.abs(origY - pointer.y)
        });
        activeObj.setCoords();
        inst.canvas.renderAll();
      };
      Circle.prototype.onMouseDown = function (event) {
        let inst = this;
        inst.enable();
        let pointer = inst.canvas.getPointer(event.e);
        origX = pointer.x;
        origY = pointer.y;
        let ellipse = new fabric.Ellipse({
          top: origY,
          left: origX,
          originX: 'left',
          originY: 'top',
          width: pointer.x - origX,
          height: pointer.y - origY,
          rx: 0,
          ry: 0,
          transparentCorners: true,
          hasBorders: false,
          hasControls: false,
          stroke: drawingColor.val(),
          strokeWidth: parseInt(drawingLineWidth.val()),
          fill: 'rgba(0,0,0,0)',
          lockMovementX: true,
          lockMovementY: true
        });
        inst.canvas.add(ellipse).setActiveObject(ellipse)
      };
      // Circleクラス内で使用するメソッドとプロパティを定義します。
      // 描画モードが有効かどうかを返すメソッドです。
      Circle.prototype.isEnable = function () {
        return this.isDrawing;
      };
      // 描画モードを有効にするメソッドです。
      Circle.prototype.enable = function () {
        this.isDrawing = true;
      };
      // 描画モードを無効にするメソッドです。
      Circle.prototype.disable = function () {
        this.isDrawing = false;
      };
      // オブジェクトがアクティブかどうかを返すメソッドです。
      Circle.prototype.active = function () {
        this.isActive = true;
      };
      // オブジェクトを非アクティブにするメソッドです。
      Circle.prototype.desactive = function () {
        this.isActive = false;
      };
      // Circleクラスの定義を終了します。
      return Circle;
    }());
    // Arrow（矢印）クラスの定義が始まります。
    var Arrow = (function () {
      function Arrow(canvas) {
        this.canvas = canvas;
        this.className = 'Arrow';
        this.isDrawing = false;
        this.isActive = false;
        this.bindEvents();
      }
      // イベントハンドラーをバインドします。
      Arrow.prototype.bindEvents = function () {
        let inst = this;
        inst.canvas.on('mouse:down', function (o) {
          if (inst.isActive) inst.onMouseDown(o);
        });
        inst.canvas.on('mouse:move', function (o) {
          if (inst.isActive) inst.onMouseMove(o);
        });
        inst.canvas.on('mouse:up', function (o) {
          if (inst.isActive) inst.onMouseUp(o);
        });
        inst.canvas.on('object:moving', function (o) {
          if (inst.isActive) inst.disable();
        });
      };
      // マウスが離されたときの処理を行います。
      Arrow.prototype.onMouseUp = function (o) {
        let inst = this;
        if (inst.isEnable()) canvas.fire('object:finish', {
          target: inst.canvas.getActiveObject()
        });
        inst.disable();
      };
      // マウスが移動したときの処理を行います。
      Arrow.prototype.onMouseMove = function (o) {
        let inst = this;
        if (!inst.isEnable()) {
          return;
        }
        // マウスポインターの位置を取得します。
        let pointer = inst.canvas.getPointer(o.e);
        let activeObj = inst.canvas.getActiveObject();
        // アクティブなオブジェクト（矢印）の終点座標を更新します。
        activeObj.set({
          x2: pointer.x,
          y2: pointer.y
        });
        activeObj.setCoords();
        inst.canvas.renderAll();
      };
      // Arrowクラスの定義を終了します。
      // Arrowクラス内でマウスがクリックされたときの処理を行います。
      Arrow.prototype.onMouseDown = function (o) {
        let inst = this;
        inst.enable();
        // マウスポインターの位置を取得します。
        let pointer = inst.canvas.getPointer(o.e);
        // 矢印の始点と終点を同じ位置に設定します。
        let points = [pointer.x, pointer.y, pointer.x, pointer.y];
        // 新しい矢印オブジェクトを作成し、キャンバスに追加します。
        let line = new fabric.Arrow(points, {
          strokeWidth: parseInt(drawingLineWidth.val()), // 描画の線の幅を設定します。
          fill: drawingColor.val(), // 塗りつぶしの色を設定します。
          stroke: drawingColor.val(), // 描画の色を設定します。
          originX: 'center',
          originY: 'center',
          hasBorders: false,
          hasControls: false,
          lockMovementX: true, // X軸方向への移動をロックします。
          lockMovementY: true // Y軸方向への移動をロックします。
        });
        // 作成した矢印オブジェクトをキャンバスに追加し、アクティブなオブジェクトに設定します。
        inst.canvas.add(line).setActiveObject(line);
      };
      // Arrowクラス内で描画モードが有効かどうかを返すメソッドです。
      Arrow.prototype.isEnable = function () {
        return this.isDrawing;
      };
      // Arrowクラス内で描画モードを有効にするメソッドです。
      Arrow.prototype.enable = function () {
        this.isDrawing = true;
      };
      // Arrowクラス内で描画モードを無効にするメソッドです。
      Arrow.prototype.disable = function () {
        this.isDrawing = false;
      };
      // Arrowクラス内でオブジェクトがアクティブかどうかを返すメソッドです。
      Arrow.prototype.active = function () {
        this.isActive = true;
      };
      // Arrowクラス内でオブジェクトを非アクティブにするメソッドです。
      Arrow.prototype.desactive = function () {
        this.isActive = false;
      };
      // Arrowクラスの定義を終了します。
      return Arrow;
    }());
    // CircleクラスとArrowクラスのインスタンスを作成します。
    let c = new Circle(canvas), // Circleのインスタンス
      a = new Arrow(canvas); // Arrowのインスタンス
    // イレーザーモードが無効かどうかを示すフラグです。
    let isEraserMode = false;
    // キャンバスの描画ブラシ設定を行います。
    canvas.freeDrawingBrush.color = drawingColor.val(); // 描画の色を設定します。
    canvas.freeDrawingBrush.width = parseInt(drawingLineWidth.val(), 10) || 1; // 描画の線の幅を設定します。
    // キャンバスをクリアするボタンがクリックされたときの処理を設定します。
    $('#clear-canvas').on('click', function () {
      // 確認ダイアログを表示し、OKボタンが押された場合のみキャンバスをクリアします。
      var confirmation = confirm('キャンバスをクリアしますか？');
      if (confirmation) {
        clear(); // キャンバスをクリアする関数を呼び出します。
      }
    });
    // 背景オプションが変更されたときの処理を設定します。
    $('#background-options').on('change', function () {
      setBackground(this.value); // 選択された背景を設定します。
      clear(); // キャンバスをクリアします。
      // Firebaseデータベース内のルーム情報を更新します。
      currentRoom.update({
        map: this.value
      });
    });
    // 描画の色が変更されたときの処理を設定します。
    drawingColor.on('change', function () {
      canvas.freeDrawingBrush.color = this.value; // 描画ブラシの色を設定します。
    });
    // 描画の線の幅が変更されたときの処理を設定します。
    drawingLineWidth.on('change mousemove', function () {
      canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1; // 描画ブラシの幅を設定します。
      $(".number-range").html(this.value + "px"); // 幅を表示します。
    });
    // 色選択ボタンがクリックされたときの処理を設定します。
    $(".colors div").on('click', function () {
      let value = $(this).attr('id');
      canvas.freeDrawingBrush.color = value; // 描画ブラシの色を設定します。
      drawingColor.val(value); // 色の選択ボックスの値を設定します。
    });
    // ライン描画モードが選択されたときの処理を設定します。
    $("#line-drawing").on('click', function () {
      canvas.isDrawingMode = true; // 描画モードを有効にします。
      c.desactive(); // Circle描画モードを無効にします。
      a.desactive(); // Arrow描画モードを無効にします。
    });
    // 円描画モードが選択されたときの処理を設定します。
    $("#circle-drawing").on('click', function () {
      canvas.isDrawingMode = false; // 描画モードを無効にします。
      c.active(); // Circle描画モードを有効にします。
      a.desactive(); // Arrow描画モードを無効にします。
    });
    // 矢印描画モードが選択されたときの処理を設定します。
    $("#arrow-drawing").on('click', function () {
      canvas.isDrawingMode = false; // 描画モードを無効にします。
      a.active(); // Arrow描画モードを有効にします。
      c.desactive(); // Circle描画モードを無効にします。
    });
    // オブジェクト削除ボタンがクリックされたときの処理を設定します。
    // オブジェクト削除ボタンがクリックされたときの処理を設定します。
    $('#delete-shape-button').on('click', function () {
      canvas.isDrawingMode = false; // 描画モードを無効にします。
      c.desactive(); // Circle描画モードを無効にします。
      a.desactive(); // Arrow描画モードを無効にします.
      var selectedObject = canvas.getActiveObject();
      if (selectedObject && !selectedObject.isBackground) {
        // 選択されたオブジェクトを削除しますが、背景オブジェクトでない場合にのみ削除します。
        canvas.remove(selectedObject);
      }
      // キャンバスのコンテンツをFirebaseデータベースに更新します。
      currentRoom.update({
        content: JSON.stringify(canvas)
      });
    });

    // キャンバス上のオブジェクトが選択されたときの処理を設定します。
    canvas.on('object:selected', function (e) {
      var selectedObject = e.target;
      canvas.remove(selectedObject); // 選択されたオブジェクトを削除します。
    });
    // 背景を設定する関数です。
    function setBackground(backgroundImage) {
      if (backgroundImage === "none") {
        // 背景画像をクリアする
        canvas.setBackgroundImage(null);
        canvas.setBackgroundColor({
          source: 'img/grid.png',
          repeat: 'repeat'
        }, function () {
          canvas.renderAll();
        });
      } else {
        fabric.Image.fromURL('img/' + backgroundImage + '.png', function (img) {
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / img.width,
            scaleY: canvas.height / img.height
          });
        });
      }
    }

    // キャンバスをクリアする関数です。
    function clear() {
      canvas.clear(); // キャンバスをクリアします。
      setBackground($('#background-options').val()); // 背景を再設定します。
    }
    // F2キーが押されたときにキャンバスをクリアするイベントを設定します。
    $().on('keydown', null, 'F2', clear);
    // Firebaseのデータベースからキャンバスのコンテンツを取得します。
    currentRoom.child('content').once('value', function (data) {
      // Syncクラスのインスタンスを作成します。
      let sync = new Sync();
      // Firebaseのデータベース内で背景（map）が変更されたときの処理を設定します。
      currentRoom.child('map').on('value', function (map) {
        let value = map.val();
        let select = $('#background-options');
        // 選択された背景が変更された場合、UIに反映させます。
        if (select.val() !== value) {
          select.val(value);
          setBackground(value); // 背景を設定します。
        }
      });
      // Firebaseのデータベース内でキャンバスのコンテンツ（描画パス）が追加されたときの処理を設定します。
      let queueRef = currentRoom.child('queue');
      canvas.on('path:created', function (data) {
        if (sync.status) {
          return;
        }
        // パス（描画オブジェクト）を設定します。
        data.path.set({
          lockMovementX: true,
          lockMovementY: true
        });
        // キャンバスのコンテンツをFirebaseデータベースに更新します。
        currentRoom.update({
          content: JSON.stringify(canvas)
        });
        // キューにイベントを追加します。
        queueRef.push().set({
          event: JSON.stringify(data.path),
          by: uID,
          time: Date.now().toString()
        });
      });
      // Firebaseのデータベース内でオブジェクトの描画が完了したときの処理を設定します。
      canvas.on('object:finish', function (data) {
        if (sync.status) {
          return;
        }
        // キャンバスのコンテンツをFirebaseデータベースに更新します。
        currentRoom.update({
          content: JSON.stringify(canvas)
        });
        // キューにイベントを追加します。
        queueRef.push().set({
          event: JSON.stringify(data.target),
          by: uID,
          time: Date.now().toString()
        });
      });
      // キャンバスにオブジェクトが追加されたときの処理を設定します。
      canvas.on('object:added', function (data) {
        if (sync.status) {
          return;
        }
        // 追加されたオブジェクトを移動禁止に設定します。
        data.target.set({
          lockMovementX: true,
          lockMovementY: true
        });
      });
      // キャンバスがクリアされたときの処理を設定します。
      canvas.on('canvas:cleared', function () {
        if (sync.status) {
          return;
        }
        // キャンバスのコンテンツをFirebaseデータベースに更新します。
        currentRoom.update({
          content: JSON.stringify(canvas)
        });
        // キューにクリアイベントを追加し、その後キューを削除します。
        queueRef.push().set({
          event: "clear",
          by: uID,
          time: Date.now().toString()
        }).then(() => {
          queueRef.remove()
        });
      });
      // キュー内に新しいイベントが追加されたときの処理を設定します。
      queueRef.on('child_added', function (child) {
        let value = child.val();
        let timestamp = value.time;
        // 新しいイベントを受信したら、同期を開始します。
        if (now > timestamp || value.by === uID) {
          return;
        }
        sync.on();
        // イベントがクリアイベントの場合、キャンバスをクリアします。
        if (value.event === "clear") {
          clear();
        } else {
          // それ以外の場合、オブジェクトをキャンバスに追加します。
          let newObj = JSON.parse(value.event);
          new fabric[fabric.util.string.capitalize(newObj.type)].fromObject(newObj, function (obj) {
            canvas.add(obj);
          });
        }
        // 同期を終了します。
        sync.off();
      });
      // キャンバスの初期データをFirebaseデータベースから取得します。
      let val = data.val();
      // もし初回アクセスの場合、キャンバスの初期データを作成してデータベースに保存します。
      if (val === null) {
        val = JSON.stringify(canvas);
        // Firebaseデータベース内に新しいルームを作成し、初期データを設定します。
        rooms.child(roomID).set({
          content: val, // キャンバスの初期データを保存します。
          map: "none", // 背景の初期設定を保存します。
          queue: {} // キューの初期設定を保存します。
        });
      }
      sync.on(); // 同期を開始します。
      // キャンバスの初期データをロードします。
      canvas.loadFromJSON(JSON.parse(val));
      // Firebaseデータベース内で背景の初期設定を取得し、キャンバスの背景を設定します。
      currentRoom.child('map').once('value', function (content) {
        let val = content.val();
        setBackground(val); // 背景を設定します。
      });
      sync.off(); // 同期を終了します。
      $("#loader").fadeOut(); // ローディングスピナーを非表示にします。
      $("main").fadeIn(); // メインコンテンツを表示します。
    });
  
    function getUrlParameter(myParam) {
      let url = decodeURIComponent(window.location.search.substring(1));
      let urlParams = url.split('&');
      for (let i = 0; i < urlParams.length; i++) {
        let currentParam = urlParams[i].split('=');
        if (currentParam[0] === myParam) {
          return currentParam[1] === undefined ? true : currentParam[1];
        }
      }
      return null;
    }
    let Sync = (function () {
      function Sync() {
        this.status = false;
      }
      Sync.prototype.status = function () {
        return this.status;
      };
      Sync.prototype.on = function () {
        this.status = true;
      };
      Sync.prototype.off = function () {
        this.status = false;
      };
      return Sync;
    }());
  });