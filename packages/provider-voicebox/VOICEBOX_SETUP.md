# VOICEVOX セットアップガイド

このドキュメントでは、VOICEVOX エンジンのセットアップ方法を説明します。

## 方法 1: 公式アプリをインストール（推奨）

1. [VOICEVOX 公式サイト](https://voicevox.hiroshiba.jp/)からダウンロード
2. お使いの OS に合わせてインストール
   - **Windows**: インストーラーを実行
   - **macOS**: DMG を開いてアプリケーションフォルダにドラッグ
   - **Linux**: AppImage に実行権限を付与して起動
3. VOICEVOX を起動すると、エンジンが自動的に `http://localhost:50021` で起動します

## 方法 2: Docker を使用

```bash
# 基本的な起動
docker run --rm -p 50021:50021 voicevox/voicevox_engine:cpu-latest

# GPU を使用する場合（NVIDIA）
docker run --rm --gpus all -p 50021:50021 voicevox/voicevox_engine:nvidia-latest

# バックグラウンドで起動
docker run -d -p 50021:50021 --name voicevox voicevox/voicevox_engine:cpu-latest
```

## 方法 3: エンジンのみをインストール

GUI が不要な場合、エンジンのみをインストールできます。

1. [VOICEVOX ENGINE リリースページ](https://github.com/VOICEVOX/voicevox_engine/releases)からダウンロード
2. 解凍して実行

```bash
# Linux/macOS
./run

# Windows
run.exe
```

## 動作確認

エンジンが正常に起動しているか確認：

```bash
curl http://localhost:50021/version
# => "0.xx.x" のようにバージョンが表示されれば OK
```

利用可能な話者一覧を確認：

```bash
curl http://localhost:50021/speakers | jq
```
