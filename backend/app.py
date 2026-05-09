# -*- coding: utf-8 -*-
"""
Meltwatch Backend API
LLM-powered AI assistant with knowledge base
"""

import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/api/v1/health', methods=['GET'])
def health_check():
    """Health check"""
    return jsonify({
        "status": "ok",
        "service": "meltwatch-api",
        "version": "1.0.0"
    })


# Register LLM blueprint with knowledge base and skill system
from routes.llm import llm_bp
app.register_blueprint(llm_bp)

# Register Auth blueprint for user authentication
from auth import auth_bp
app.register_blueprint(auth_bp)


if __name__ == '__main__':
    print("✅ Meltwatch API started")
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
