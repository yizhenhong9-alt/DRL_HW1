from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/converge_policy_eval', methods=['POST'])
def converge_policy_eval():
    data = request.json
    n = data.get('gridSize')
    end = tuple(data.get('end'))
    obstacles = [tuple(o) for o in data.get('obstacles')]
    policy = data.get('policy') # 這邊改拿前端送進來的箭頭矩陣
    
    theta = 1e-4
    gamma = 0.9
    action_map = {"↑": (-1, 0), "↓": (1, 0), "←": (0, -1), "→": (0, 1)}
    
    V = [[0.0 for _ in range(n)] for _ in range(n)]
    iterations = 0
    
    while True:
        delta = 0
        for r in range(n):
            for c in range(n):
                if (r, c) == end or (r, c) in obstacles:
                    continue
                
                v_old = V[r][c]
                
                # 取得該狀態目前的策略 (單一方向)
                arrow = policy[r][c]
                dr, dc = action_map.get(arrow, (0, 0))
                
                nr, nc = r + dr, c + dc
                if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles:
                    reward, ns = -1.0, (r, c)
                elif (nr, nc) == end:
                    reward, ns = 10.0, (nr, nc)
                else:
                    reward, ns = -0.1, (nr, nc)
                
                # 更新公式 V(s) = R + gamma * V(s')
                V[r][c] = reward + gamma * V[ns[0]][ns[1]]
                delta = max(delta, abs(v_old - V[r][c]))
        
        iterations += 1
        if delta < theta: break
        if iterations > 2000: break
        
    return jsonify({"values": V, "iterations": iterations})

@app.route('/step_evaluate', methods=['POST'])
def step_evaluate():
    # ... (Keep this for single step arrow evaluation if needed by other features)
    data = request.json
    n = data.get('gridSize')
    end = tuple(data.get('end'))
    obstacles = [tuple(o) for o in data.get('obstacles')]
    policy_data = data.get('policy')
    V = data.get('currentValues')
    gamma = 0.9
    action_map = {"↑": (-1, 0), "↓": (1, 0), "←": (0, -1), "→": (0, 1)}
    new_V = [[row[c] for c in range(n)] for row in V] 
    for r in range(n):
        for c in range(n):
            if (r, c) == end or (r, c) in obstacles: continue
            arrow = policy_data[r][c]
            dr, dc = action_map.get(arrow, (0, 0))
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles:
                reward, ns = -1.0, (r, c)
            elif (nr, nc) == end:
                reward, ns = 10.0, (nr, nc)
            else:
                reward, ns = -0.1, (nr, nc)
            new_V[r][c] = reward + gamma * V[ns[0]][ns[1]]
    return jsonify({"values": new_V})

@app.route('/vi_step', methods=['POST'])
def vi_step():
    data = request.json
    n = data.get('gridSize')
    end = tuple(data.get('end'))
    obstacles = [tuple(o) for o in data.get('obstacles')]
    V = data.get('currentValues')
    
    gamma = 0.9
    action_data = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    new_V = [[0.0 for _ in range(n)] for _ in range(n)]
    delta = 0
    for r in range(n):
        for c in range(n):
            if (r, c) == end or (r, c) in obstacles:
                continue
            
            action_values = []
            for dr, dc in action_data:
                nr, nc = r + dr, c + dc
                if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles:
                    reward, next_state = -1.0, (r, c)
                elif (nr, nc) == end:
                    reward, next_state = 10.0, (nr, nc)
                else:
                    reward, next_state = -0.1, (nr, nc)
                action_values.append(reward + gamma * V[next_state[0]][next_state[1]])
            
            new_V[r][c] = max(action_values)
            delta = max(delta, abs(new_V[r][c] - V[r][c]))
            
    return jsonify({"values": new_V, "delta": delta})

@app.route('/get_best_results', methods=['POST'])
def get_best_results():
    data = request.json
    n = data.get('gridSize')
    start = tuple(data.get('start'))
    end = tuple(data.get('end'))
    obstacles = [tuple(o) for o in data.get('obstacles')]
    V = data.get('values')
    
    gamma = 0.9
    action_info = [
        {"arrow": "↑", "move": (-1, 0)},
        {"arrow": "↓", "move": (1, 0)},
        {"arrow": "←", "move": (0, -1)},
        {"arrow": "→", "move": (0, 1)}
    ]
    
    # 1. Optimal Policy
    policy = [["" for _ in range(n)] for _ in range(n)]
    for r in range(n):
        for c in range(n):
            if (r, c) == end: policy[r][c] = "★"; continue
            if (r, c) in obstacles: policy[r][c] = "✖"; continue
            
            best_val = -float('inf')
            best_arrow = "↑"
            for act in action_info:
                dr, dc = act["move"]
                nr, nc = r + dr, c + dc
                if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles:
                    reward, ns = -1.0, (r, c)
                elif (nr, nc) == end:
                    reward, ns = 10.0, (nr, nc)
                else:
                    reward, ns = -0.1, (nr, nc)
                
                val = reward + gamma * V[ns[0]][ns[1]]
                if val > best_val:
                    best_val = val
                    best_arrow = act["arrow"]
            policy[r][c] = best_arrow

    # 2. Optimal Path
    path = []
    curr = start
    visited = set()
    while curr != end and curr not in visited and len(path) < n*n:
        visited.add(curr)
        path.append(list(curr))
        r, c = curr
        best_next = curr
        best_val = -float('inf')
        for act in action_info:
            dr, dc = act["move"]
            nr, nc = r + dr, c + dc
            if nr < 0 or nr >= n or nc < 0 or nc >= n or (nr, nc) in obstacles:
                v = -1.0 + gamma * V[r][c]
            else:
                v = (10.0 if (nr, nc) == end else -0.1) + gamma * V[nr][nc]
            if v > best_val:
                best_val = v
                best_next = (nr, nc)
        curr = best_next
    if curr == end: path.append(list(end))

    return jsonify({"policy": policy, "path": path})

if __name__ == '__main__':
    app.run(debug=True)
