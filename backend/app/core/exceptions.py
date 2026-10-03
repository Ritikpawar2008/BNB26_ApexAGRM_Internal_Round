from fastapi import HTTPException

class CreatorAIException(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details=None):
        super().__init__(
            status_code=status_code,
            detail={"success": False, "error": {"code": code, "message": message, "details": details}}
        )
