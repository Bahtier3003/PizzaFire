using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PizzaFire_API.Data;
using PizzaFire_API.DTOs;
using PizzaFire_API.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PizzaFire_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly PizzaDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(PizzaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
        {
            // Проверяем, существует ли пользователь
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest(new { message = "Пользователь с таким логином уже существует" });
            }

            try
            {
                // Создаем нового пользователя с ВСЕМИ переданными данными
                var user = new User
                {
                    Username = registerDto.Username,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
                    Email = registerDto.Email ?? "", // Сохраняем email
                    FirstName = registerDto.FirstName ?? "", // Сохраняем имя
                    LastName = registerDto.LastName ?? "", // Сохраняем фамилию
                    CreatedAt = DateTime.UtcNow
                };

                // Добавляем пользователя в базу данных
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Генерируем токен
                var token = GenerateJwtToken(user);

                return new AuthResponseDto
                {
                    Token = token,
                    Username = user.Username,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                };
            }
            catch (Exception ex)
            {
                // Логируем ошибку для отладки
                Console.WriteLine($"Ошибка при регистрации: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Ошибка при создании пользователя" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return Unauthorized("Неверный логин или пароль");
            }

            var token = GenerateJwtToken(user);
            return new AuthResponseDto
            {
                Token = token,
                Username = user.Username
            };
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // Важно: добавляем ID пользователя
                new Claim(ClaimTypes.Name, user.Username)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}