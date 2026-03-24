# GridWorld Reinforcement Learning Interactive System (DRL_hw1)

這是一個為深度強化式學習課程開發的互動式網格世界 (GridWorld) 模擬系統。本系統專注於視覺化展現 **策略評估 (Policy Evaluation)** 與 **價值迭代 (Value Iteration)** 之間的差異，並提供一個直觀的環境設定介面。

## 🌟 核心功能

1.  **動態環境生成**：支援 5x5 到 9x9 的網格維度設定。
2.  **互動式設定**：
    *   **起始點 (Green)**：標記學習的起點。
    *   **終點 (Red)**：目標點，設定後進入該狀態會獲得巨大獎勵 (+10)。
    *   **障礙物 (Grey)**：限制為 $n-2$ 個。
3.  **對照式視覺化**：
    *   **Policy Evaluation (策略評估)**：針對當前策略進行收斂計算，展現 deterministic policy 下的價值分佈。
    *   **Value Iteration (價值迭代)**：動態演示價值演化，並標示出「黃金路徑」。
4.  **智慧型 UI**：
    *   **縮圖預覽 (Mini-Map)**：鎖定後的環境細節會收納至側邊欄，釋放空間進行觀測。

## 📸 介面展示 (Demo)

![環境設定介面](assets/demo_setup.png)
*圖 1：環境設定 Phase。使用者進行維度選擇、起點、終點與障礙物配置。*

![計算結果比較介面](assets/demo_results.png)
*圖 2：演算法對照 Phase。左側展示策略評估 (PE)，右側展示價值迭代 (VI) 的最佳化結果與路徑。*

## 📖 使用說明 (Step-by-Step)

### 第一步：初始化網格 (Initialize)
- 在側邊欄輸入 **Dimension (5-9)**。
- 點擊 **Generate Grid**。此時尺寸輸入框會隱藏，進入環境配置。

### 第二步：配置環境 (Environment Setup)
- 選擇標籤模式：**Start Point** (綠色)、**End Point** (紅色)、**Obstacle** (灰色)。
- 直接在右側網格中點擊進行標記（再次點擊可取消選取）。
- 確認配置完成後，點擊側邊欄底部的 **Lock Environment**。

### 第三步：生成策略 (Generate Policy)
- 此時環境大圖會縮小為左側的 **Mini-Map** 預覽。
- 點擊 **Generate Policy**，為系統生成一組初始的隨機行動策略（箭頭）。

### 第四步：執行演算法 (Run Algorithms)
- **Policy Evaluation**：點擊後系統會立即計算在當前策略（隨機箭頭）下的收斂數值。
- **Value Iteration**：點擊後右側網格會開始動態閃動，展現價值遞增的過程。完成後會自動標示出 **金色最佳路徑**。

## 🚀 數學模型說明

- **獎勵機制 (Rewards)**：終點 `+10` / 邊界與障礙物 `-1` / 普通步數 `-0.1`
- **參數設定**：折扣因子 ($\gamma$) = `0.9` / 收斂門檻 ($\theta$) = `1e-4`
- **演算法**：嚴格遵循 Bellman Equation，Policy Evaluation 使用 `while` 迴圈至收斂。

## 🛠️ 技術棧

- **後端**：Python Flask (RESTful API)
- **前端**：Vanilla JavaScript, CSS3 (Modern Flexbox/Grid Layout)

## 📦 安裝與運行
```bash
pip install -r requirements.txt
python app.py
```
在瀏覽器開啟：`http://127.0.0.1:5000`

---
**開發者**：Yi Zhen Hung
**課程**：深度強化式學習 (碩士班)
