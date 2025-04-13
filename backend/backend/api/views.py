from django.http import JsonResponse

def saludo(request):
    return JsonResponse({"mensaje": "Hola mundo xd"})
