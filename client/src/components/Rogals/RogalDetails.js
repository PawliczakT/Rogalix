import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../api';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemText,
    Rating,
    TextField,
    Typography
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RecommendIcon from '@mui/icons-material/Recommend';

const RogalDetails = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const [rogal, setRogal] = useState({});
    const [rating, setRating] = useState('');
    const [comment, setComment] = useState('');
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [qualityAnalysis, setQualityAnalysis] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

    useEffect(() => {
        const fetchRogalData = async () => {
            try {
                setIsLoadingAnalysis(true);
                const [rogalRes, analysisRes, loginCheck] = await Promise.all([
                    api.get(`/rogals/${id}`),
                    api.get(`/rogals/quality/${id}`),
                    api.get('/users/me')
                ]);

                setRogal(rogalRes.data);
                setQualityAnalysis(analysisRes.data.analysis);
                setRecommendations(analysisRes.data.recommendations || []);
                setIsLoggedIn(true);
            } catch (err) {
                if (err.response?.status === 401) {
                    setIsLoggedIn(false);
                } else {
                    console.error(err.response?.data);
                    setError('Błąd podczas ładowania danych');
                }
            } finally {
                setIsLoadingAnalysis(false);
            }
        };

        fetchRogalData();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/rogals/rating/${id}`, {rating, comment});
            const res = await api.get(`/rogals/${id}`);
            setRogal(res.data);
            setRating('');
            setComment('');
            setError(null);
        } catch (err) {
            setError(err.response?.data.msg || 'Wystąpił błąd podczas dodawania oceny');
        }
    };

    const onDelete = async () => {
        try {
            await api.delete(`/rogals/${id}`);
            navigate('/rogals');
        } catch (err) {
            setError(err.response?.data.msg || 'Wystąpił błąd podczas usuwania rogala');
        }
    };

    const RogalMainInfo = () => (
        <Card>
            <CardContent>
                <Typography variant="h4" component="h1" gutterBottom>
                    {rogal.name}
                </Typography>
                <Typography variant="body1" paragraph>
                    {rogal.description}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                            Cena: {rogal.price} zł
                        </Typography>
                        <Typography variant="body1">
                            Waga: {rogal.weight} g
                        </Typography>
                        <Typography variant="body1">
                            Średnia ocena: {rogal.averageRating?.toFixed(1) || 'Brak ocen'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="body1">
                            Stosunek jakości do ceny: {rogal.qualityToPriceRatio?.toFixed(2) || 'N/A'}
                        </Typography>
                        <Typography variant="body1">
                            Cena za 1kg: {rogal.pricePerKg?.toFixed(2) || 'N/A'} zł
                        </Typography>
                        <Typography variant="body1">
                            Liczba głosów: {rogal.ratings?.length || 0}
                        </Typography>
                    </Grid>
                </Grid>
                {rogal.image && (
                    <Box sx={{mt: 2}}>
                        <img
                            src={rogal.image}
                            alt={rogal.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                objectFit: 'contain'
                            }}
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );

    const QualityAnalysisCard = () => (
        <Card sx={{mt: 4}}>
            <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <AnalyticsIcon sx={{mr: 1}}/>
                    <Typography variant="h6">Analiza Jakości</Typography>
                </Box>
                {isLoadingAnalysis ? (
                    <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                        <CircularProgress/>
                    </Box>
                ) : qualityAnalysis ? (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Ocena Ogólna
                            </Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <Rating
                                    value={qualityAnalysis.overallScore / 2}
                                    precision={0.5}
                                    readOnly
                                    max={5}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    ({qualityAnalysis.overallScore}/10)
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" gutterBottom>
                                Aspekty Jakościowe
                            </Typography>
                            {qualityAnalysis.aspects?.map((aspect, index) => (
                                <Box key={index} sx={{mb: 1}}>
                                    <Typography variant="body2">
                                        {aspect.name}: {aspect.score}/10
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {aspect.comment}
                                    </Typography>
                                </Box>
                            ))}
                        </Grid>
                        {qualityAnalysis.suggestions?.length > 0 && (
                            <Grid item xs={12}>
                                <Divider sx={{my: 2}}/>
                                <Typography variant="subtitle1" gutterBottom>
                                    Sugestie Ulepszeń
                                </Typography>
                                <List dense>
                                    {qualityAnalysis.suggestions.map((suggestion, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={suggestion.title}
                                                secondary={suggestion.description}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        )}
                    </Grid>
                ) : (
                    <Typography color="text.secondary">
                        Brak dostępnej analizy
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const RecommendationsCard = () => (
        <Card sx={{mt: 4}}>
            <CardContent>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                    <RecommendIcon sx={{mr: 1}}/>
                    <Typography variant="h6">Podobne Rogale</Typography>
                </Box>
                {recommendations.length > 0 ? (
                    <Grid container spacing={2}>
                        {recommendations.map((rec, index) => (
                            <Grid item xs={12} md={6} key={index}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1">
                                            {rec.name}
                                        </Typography>
                                        <Box sx={{display: 'flex', alignItems: 'center', mt: 1}}>
                                            <Chip
                                                label={`${rec.similarity}% podobieństwa`}
                                                color="primary"
                                                size="small"
                                                sx={{mr: 1}}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                {rec.reason}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography color="text.secondary">
                        Brak podobnych rogali
                    </Typography>
                )}
            </CardContent>
        </Card>
    );

    const RatingForm = () => (
        <Box sx={{mt: 4}}>
            <Typography variant="h5" component="h2" gutterBottom>
                Dodaj ocenę
            </Typography>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
            <form onSubmit={onSubmit}>
                <TextField
                    type="number"
                    label="Ocena"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Ocena od 1 do 6"
                    inputProps={{min: "1", max: "6", step: "0.5"}}
                    fullWidth
                    required
                    sx={{mb: 2}}
                />
                <TextField
                    label="Komentarz"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Dodaj komentarz (opcjonalnie)"
                    multiline
                    rows={4}
                    fullWidth
                    sx={{mb: 2}}
                />
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={!rating}
                >
                    Dodaj ocenę
                </Button>
            </form>
        </Box>
    );

    return (
        <Container>
            <Box sx={{mt: 4, mb: 4}}>
                <RogalMainInfo/>
                <QualityAnalysisCard/>
                <RecommendationsCard/>
                {isLoggedIn && <RatingForm/>}
            </Box>
        </Container>
    );
};

export default RogalDetails;
