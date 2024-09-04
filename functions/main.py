from flask import Flask, request, jsonify
from flask_cors import CORS
from sympy import symbols, Eq, solve

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Thêm cấu hình CORS

@app.route('/sympy_solver', methods=['POST'])
def sympy_solver():
    data = request.get_json(silent=True)
    equations = data.get('equations')
    
    if not equations:
        return jsonify({'error': 'No equations provided'}), 400
    
    try:
        # Define the symbols
        variables = set()
        for eq in equations:
            for char in eq:
                if char.isalpha():
                    variables.add(char)
        symbols_dict = {var: symbols(var) for var in variables}
        
        # Convert string equations to sympy equations
        sympy_equations = [Eq(eval(eq, symbols_dict), 0) for eq in equations]
        
        # Solve the equations
        solutions = solve(sympy_equations, list(symbols_dict.values()))
        
        # Convert solutions to a readable format
        solutions_str = {str(key): str(value) for key, value in solutions.items()}
        
        return jsonify({'solutions': solutions_str})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
