# GridWorld Reinforcement Learning Interactive System (DRL_hw1)

這是一個為深度強化式學習課程開發的互動式網格世界 (GridWorld) 模擬系統。本系統專注於視覺化展現 **策略評估 (Policy Evaluation)** 與 **價值迭代 (Value Iteration)** 之間的差異，並提供一個直觀的環境設定介面。

## 🌟 核心功能

1.  **動態環境生成**：支援 5x5 到 9x9 的網格維度設定。
2.  **互動式設定**：
    *   **起始點 (Green)**：點擊設定學習的起點。
    *   **終點 (Red)**：目標點，設定後進入該狀態會獲得巨大獎勵 (+10)。
    *   **障礙物 (Grey)**：限制為 $n-2$ 個，設定後該區域為不可進入狀態。
3.  **對照式視覺化**：
    *   **Policy Evaluation (策略評估)**：針對隨機或自定義策略進行收斂計算，展現 deterministic policy 下的價值分佈。
    *   **Value Iteration (價值迭代)**：動態演示價值收斂過程，最終找出最佳策略 (Optimal Policy) 並標示出黃金路徑。
4.  **智慧型 UI**：
    *   **縮圖預覽 (Mini-Map)**：鎖定環境後，地圖會收納至側邊欄，釋放空間進行雙圖並列對比。
    *   **免捲軸設計**：自動調整佈局，確保實驗結果在同一畫面中完整呈現。

## 🚀 數學模型說明

*   **獎勵機制 (Rewards)**：
    *   到達終點：`+10`
    *   碰到邊界或障礙物：`-1`
    *   一般步數消耗：`-0.1`
*   **參數設定**：
    *   折扣因子 ($\gamma$)：`0.9`
    *   收斂門檻 ($\theta$)：`1e-4`
*   **演算法**：
    *   嚴格遵循 Bellman Equation 進行更新。
    *   Policy Evaluation 使用 `while` 迴圈計算至收斂。

## 🛠️ 技術棧

*   **後端**：Python Flask (RESTful API)
*   **前端**：Vanilla JavaScript, CSS3 (Modern Flexbox/Grid Layout)
*   **字體**：Google Fonts (Inter)

## 📦 安裝與運行

1.  安裝相依套件：
    ```bash
    pip install -r requirements.txt
    ```
2.  啟動開發伺服器：
    ```bash
    python app.py
    ```
3.  在瀏覽器開啟：`http://127.0.0.1:5000`

## 🌐 線上預覽 (Deployment)

[在此處填寫您的部署網址，例如：https://my-drl-gridworld.render.com]

---

**指導老師**：[請填寫老師姓名]
**開發者**：[請填寫您的姓名]
**課程**：深度強化式學習 (碩士班)
